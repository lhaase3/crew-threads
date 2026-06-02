const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { decrementInventory, logOrderToSheet } = require('./sheets');
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

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

const app = express();
const PORT = 5000;



app.use(cors());
app.use(express.json());



app.post('/api/order', async (req, res) => {
  const { firstName, lastName, email, phone, address, state, zipcode, size } = req.body;
  if (!firstName || !lastName || !email || !phone || !address || !state || !zipcode || !size) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    await decrementInventory(size);
    const order = {
      firstName,
      lastName,
      email,
      phone,
      address, // Street Address
      state,
      zipcode,
      size,
      date: new Date().toISOString()
    };
    await logOrderToSheet(order);
    sendOrderEmail(order);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Order failed.' });
  }
});


// Optionally, implement inventory endpoint using Google Sheets if needed

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
