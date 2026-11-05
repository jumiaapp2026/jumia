require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Checkout payment endpoint
app.post('/api/pay', async (req, res) => {
    try {
        let { phone, amount, reference } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required." });
        }

        // Format phone number to international format (e.g., 2547XXXXXXXX)
        if (phone.startsWith('0')) {
            phone = '254' + phone.slice(1);
        } else if (phone.startsWith('+')) {
            phone = phone.slice(1);
        }

        // Default to the checkout total (KES 27,499) if amount isn't provided
        const paymentAmount = amount ? Number(amount) : 27499;
        const orderRef = reference || `Jumia-Order-${Date.now()}`;

        // Send request to Smartpay Wallet STK Push API
        const response = await axios.post(
            process.env.SMARTPAY_API_URL,
            {
                phone: phone,
                amount: paymentAmount,
                ref: orderRef,
                desc: "Payment for Jumia Order KES 27,499"
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SMARTPAY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "STK push initiated successfully. Please check your phone to enter your PIN.",
            data: response.data
        });

    } catch (error) {
        console.error('STK Push Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate STK push via Smartpay Wallet.",
            error: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
