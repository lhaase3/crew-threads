require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const Stripe = require('stripe');
const dns = require('dns');
const { decrementInventory, logOrderToSheet } = require('./sheets');
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpForceIpv4 = process.env.SMTP_FORCE_IPV4 !== 'false';
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const processedStripeEvents = new Set();

const smtpLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4, all: false }, callback);
};

if (smtpForceIpv4 && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

const transporter = gmailUser && gmailAppPassword
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      ...(smtpForceIpv4 ? { family: 4 } : {}),
      ...(smtpForceIpv4 ? { lookup: smtpLookup } : {}),
    })
  : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter verification failed:', error.message);
    } else {
      console.log(`Email transporter ready (${smtpHost}:${smtpPort}, secure=${smtpSecure}, ipv4=${smtpForceIpv4})`);
    }
  });
}

async function deliverEmail({ to, subject, text }) {
  if (sendgridApiKey && sendgridFromEmail) {
    try {
      await sgMail.send({
        to,
        from: sendgridFromEmail,
        subject,
        text,
      });
      return { provider: 'sendgrid', ok: true };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error.response?.body || error.message || error);
    }
  }

  if (!transporter) {
    console.warn('Skipping email because neither SendGrid nor Gmail SMTP is fully configured.');
    return { provider: 'none', ok: false };
  }

  try {
    const info = await transporter.sendMail({
      from: gmailUser,
      to,
      subject,
      text,
    });
    return { provider: 'smtp', ok: true, response: info.response };
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return { provider: 'smtp', ok: false };
  }
}

async function sendOrderEmail(order) {
  const toRecipients = ['haatchedinterns@gmail.com', 'loganhaase3@gmail.com', 'haases@purdue.edu'];
  const subject = 'New Crew Threads Order';
  const text = `A new order has been placed for Crew Threads.\n\nDetails:\nFirst Name: ${order.firstName}\nLast Name: ${order.lastName}\nEmail: ${order.email}\nPhone: ${order.phone}\nAddress: ${order.address}\nState: ${order.state}\nZip Code: ${order.zipcode}\nSize: ${order.size}\nDate: ${order.date}`;

  const result = await deliverEmail({ to: toRecipients, subject, text });
  if (result.ok) {
    console.log(`Order email sent via ${result.provider}.`);
  }
}

async function sendCustomerConfirmationEmail(order) {
  const subject = 'Thank you for your Crew Threads purchase';
  const text = `Hi ${order.firstName},\n\nThank you for your purchase from Crew Threads. Your payment was successful and we are now processing your order.\n\nOrder summary:\n${order.size}\n\nShipping details:\n${order.address}\n${order.state} ${order.zipcode}\n\nIf you have any questions, reply to this email and we will help you out.\n\n- Crew Threads`;

  const result = await deliverEmail({ to: order.email, subject, text });
  if (result.ok) {
    console.log(`Customer confirmation sent via ${result.provider}.`);
  }
}

function buildOrderSummary(items) {
  return items
    .map((item) => `${item.quantity} x ${item.size}`)
    .join(', ');
}

async function processPaidOrder(orderData) {
  const { firstName, lastName, email, phone, address, state, zipcode, items } = orderData;

  for (const item of items) {
    const quantity = Number(item.quantity);
    for (let i = 0; i < quantity; i += 1) {
      await decrementInventory(item.size);
    }

    await logOrderToSheet({
      firstName,
      lastName,
      email,
      phone,
      address,
      state,
      zipcode,
      size: item.size,
      date: new Date().toISOString(),
    });
  }

  await sendOrderEmail({
    firstName,
    lastName,
    email,
    phone,
    address,
    state,
    zipcode,
    size: buildOrderSummary(items),
    date: new Date().toISOString(),
  });

  await sendCustomerConfirmationEmail({
    firstName,
    email,
    address,
    state,
    zipcode,
    size: buildOrderSummary(items),
  });
}

const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors());

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    return res.status(500).send('Stripe webhook is not configured.');
  }

  let event;

  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (processedStripeEvents.has(event.id)) {
      return res.json({ received: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderData = session.metadata ? {
        firstName: session.metadata.firstName,
        lastName: session.metadata.lastName,
        email: session.metadata.email,
        phone: session.metadata.phone,
        address: session.metadata.address,
        state: session.metadata.state,
        zipcode: session.metadata.zipcode,
        items: session.metadata.items ? JSON.parse(session.metadata.items) : [],
      } : null;

      if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Stripe session metadata is missing order items.');
      }

      await processPaidOrder(orderData);
    }

    processedStripeEvents.add(event.id);

    return res.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return res.status(500).send('Failed to process webhook.');
  }
});

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to backend .env.' });
  }

  const { firstName, lastName, email, phone, address, state, zipcode, items } = req.body;
  if (!firstName || !lastName || !email || !phone || !address || !state || !zipcode || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const invalidItem = items.some((item) => !item.size || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1);
  if (invalidItem) {
    return res.status(400).json({ error: 'Each item must include a size and quantity of at least 1.' });
  }

  const unitAmount = Number(process.env.STRIPE_UNIT_AMOUNT || 3400);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Crew Threads Shirt (${item.size})`,
        },
        unit_amount: unitAmount,
      },
      quantity: Number(item.quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${frontendUrl}/?checkout=success`,
      cancel_url: `${frontendUrl}/?checkout=cancel`,
      customer_email: email,
      metadata: {
        firstName,
        lastName,
        email,
        phone,
        address,
        state,
        zipcode,
        items: JSON.stringify(items),
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return res.status(500).json({ error: 'Unable to start Stripe checkout.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
