import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // This limits each IP to 5 requests per windowMs
});

// this applies rate limiting to contact route
app.use('/contact', limiter);

// A more secure CORS setup
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// A simple function to escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Joi validation schema
const contactSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': `"name" should be a type of 'text'`,
        'string.empty': `"name" cannot be an empty field`,
        'string.min': `"name" should have a minimum length of {#limit} characters`,
        'any.required': `"name" is a required field`
    }),
    email: Joi.string().email().required().messages({
        'string.email': `"email" must be a valid email address`,
        'any.required': `"email" is a required field`
    }),
    message: Joi.string().trim().min(10).max(1000).required().messages({
        'string.min': `"message" should have a minimum length of {#limit} characters`,
        'any.required': `"message" is a required field`
    })
});

// Validation middleware
const validateContactForm = (req, res, next) => {
    const { error } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
        // Map Joi errors to a simple array of strings
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

app.post('/contact', validateContactForm, async (req, res) => {
  const { name, email, message } = req.body;
  console.log(req.body); 

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OWNER_EMAIL,   // Use OWNER_EMAIL from .env
        pass: process.env.OWNER_EMAIL_PASS   // Use OWNER_EMAIL_PASS from .env
      }
    });

    // Email to the site owner 
    const mailOptionsToOwner = {
      from: `"Portfolio Contact" <${process.env.OWNER_EMAIL}>`, // Use your own email address
      replyTo: email, // Set the reply-to to the user's email
      to: process.env.OWNER_EMAIL, // Send to owner's email
      subject: '📩 New Message from Your Portfolio Site',
      html: `
        <h3>You've received a new message</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `
    };

    // Send the email to the site owner
    await transporter.sendMail(mailOptionsToOwner);
    console.log('Feedback email sent to owner.');

    // 2. Confirmation email to the client (if the first email was successful)
    const mailOptionsToClient = {
      from: `"Your Site Name" <${process.env.OWNER_EMAIL}>`, // From owner's email
      to: email, // Send to the client's email address
      subject: '✔ We have Received Your Message!',
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thank you for reaching out! We have successfully received your feedback.</p>
        <p>Best regards,<br/>The Team at Your Site Name</p>
      `
    };

    await transporter.sendMail(mailOptionsToClient);
    console.log('Confirmation email sent to client.');

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, error: 'Failed to send email. Try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
