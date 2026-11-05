const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for UptimeRobot keep-alive
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', timestamp: Date.now() });
});

// Endpoint to trigger STK Push
app.post('/api/stkpush', async (req, res) => {
    try {
        const { phone, amount, account_reference } = req.body;

        if (!phone || !amount) {
            return res.status(400).json({ success: false, message: 'Phone and amount are required.' });
        }

        // Standardize phone number format (0712345678 -> 254712345678)
        let formattedPhone = phone.trim().replace(/\+/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        console.log(`Initiating STK Push for phone: ${formattedPhone}, amount: ${amount}`);

        const response = await axios.post(
            'https://api.smartpaypesa.com/v1/stk/push',
            {
                phone: formattedPhone,
                amount: amount,
                account_reference: account_reference || "ORDER_" + Date.now()
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
        console.error('--- SMARTPAY API ERROR ---');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Error message:', error.message);
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to initiate STK Push',
            error: error.response ? error.response.data : error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
