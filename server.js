const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Use in-memory storage

// Enable CORS for all origins
app.use(cors());

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

app.post('/send-email', upload.single('pdf'), (req, res) => {
    const customerEmail = req.body.customerEmail;
    const pdf = req.file; // Access the uploaded PDF file

    if (!pdf) {
        return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const mailOptions = {
        from: process.env.EMAIL,  // Ensure you use the correct environment variable
        to: customerEmail,  // Email recipient (customer)
        bcc: process.env.EMAIL,  // Blind carbon copy (admin)
        subject: 'Order Confirmation',
        text: 'Please find attached your order confirmation.',
        attachments: [{
            filename: 'order-summary.pdf',
            content: pdf.buffer
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Error sending email' });
        }
        console.log('Email sent:', info.response);
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
