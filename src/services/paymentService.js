const axios = require('axios');
const InsurancePolicy = require('../models/InsurancePolicy');

// Initiate M-Pesa STK Push
async function initiateSTKPush(phoneNumber, amount) {
  // Replace with your Safaricom Daraja credentials and logic
  const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: process.env.MPESA_PASSWORD,
    Amount: amount,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: 'AfyaPomoja',
    TransactionDesc: 'Insurance Premium Payment'
  }, {
    headers: { Authorization: `Bearer ${process.env.MPESA_ACCESS_TOKEN}` }
  });
  return response.data;
}

// Handle M-Pesa Payment Callback
async function handleMpesaCallback(req, res) {
  try {
    const { Body } = req.body;
    const resultCode = Body.stkCallback.ResultCode;
    const phoneNumber = Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value;
    // Find the policy by phone number and update status
    if (resultCode === 0 && phoneNumber) {
      const policy = await InsurancePolicy.findOneAndUpdate(
        { status: 'pending', 'dependents.phoneNumber': phoneNumber },
        { status: 'active', startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000) },
        { new: true }
      );
      // Optionally notify user
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process M-Pesa callback', details: error.message });
  }
}

module.exports = { initiateSTKPush, handleMpesaCallback }; 