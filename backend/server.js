require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const { decrementInventory, logOrderToSheet } = require('./sheets');
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const processedStripeEvents = new Set();

const transporter = gmailUser && gmailAppPassword
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      }
    })
  : null;

function sendOrderEmail(order) {
  if (!transporter) {
    console.warn('Skipping order email because GMAIL_USER and GMAIL_APP_PASSWORD are not configured.');
    return;
  }

  const mailOptions = {
    from: gmailUser,
    to: ['haatchedinterns@gmail.com', 'loganhaase3@gmail.com', 'haases@purdue.edu'],
    subject: 'New Crew Threads Order',
    text: `A new order has been placed for Crew Threads.\n\nDetails:\nFirst Name: ${order.firstName}\nLast Name: ${order.lastName}\nEmail: ${order.email}\nPhone: ${order.phone}\nAddress: ${order.address}\nState: ${order.state}\nZip Code: ${order.zipcode}\nSize: ${order.size}\nDate: ${order.date}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending order email:', error);
    } else {
      console.log('Order email sent:', info.response);
    }
  });
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

  sendOrderEmail({
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
