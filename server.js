const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to trigger STK Push
app.post('/api/stkpush', async (req, res) => {
    try {
        const { phone, amount, ref, desc } = req.body;

        if (!phone || !amount) {
            return res.status(400).json({ success: false, message: 'Phone and amount are required.' });
        }

        // Standardize phone number format (e.g., 0712345678 -> 254712345678)
        let formattedPhone = phone.trim().replace(/\+/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        // Trigger request to SmartPay Wallet API
        const response = await axios.post(
            'https://api.smartpaywallet.co.ke/v1/stk/push',
            {
                phone: formattedPhone,
                amount: amount,
                ref: ref || "Order-" + Date.now(),
                desc: desc || "Payment for Jumia Order"
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
            message: 'STK push sent successfully',
            data: response.data
        });

    } catch (error) {
        console.error('STK Push Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to initiate STK Push',
            error: error.response ? error.response.data : error.message
        });
    }
});

// Callback handler for transaction response
app.post('/api/callback', (req, res) => {
    const callbackData = req.body;
    console.log('Payment Callback Received:', JSON.stringify(callbackData, null, 2));
    
    // Process transaction success/failure status here

    res.status(200).json({ status: "success" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
