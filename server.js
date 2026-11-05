const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/stk-push', async (req, res) => {
  const { phone, amount, ref, desc } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  // Format phone number to international format (2547XXXXXXXX)
  let formattedPhone = phone.trim().replace('+', '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  }

  try {
    const apiResponse = await fetch('https://api.smartpaywallet.co.ke/v1/stk/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SMARTPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: formattedPhone,
        amount: Number(amount),
        ref: ref || 'JUMIA-' + Date.now(),
        desc: desc || 'Payment for goods'
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ success: false, error: data });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('STK Push Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error while initiating STK push.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
