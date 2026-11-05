const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/stkpush', async (req, res) => {
    try {
        const { phone, amount, ref, desc } = req.body;

        if (!phone || !amount) {
            return res.status(400).json({ success: false, message: 'Phone and amount are required.' });
        }

        let formattedPhone = phone.trim().replace(/\+/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        console.log(`Initiating STK Push for phone: ${formattedPhone}, amount: ${amount}`);

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
        console.error('--- SMARTPAY API ERROR ---');
        if (error.response) {
            // The request was made and the server responded with a status code outside of 2xx
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
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
