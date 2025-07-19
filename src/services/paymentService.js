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
    const { policyId, status, transactionId } = req.body;
    
    // Handle test format
    if (policyId && status) {
      if (status === 'success') {
        const policy = await InsurancePolicy.findByIdAndUpdate(
          policyId,
          { 
            status: 'active', 
            startDate: new Date(), 
            endDate: new Date(Date.now() + 365*24*60*60*1000) 
          },
          { new: true }
        );
        
        if (!policy) {
          return res.status(404).json({ 
            error: 'Policy not found',
            policyId 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Payment processed successfully',
          policy: policy 
        });
      } else {
        return res.status(400).json({ 
          error: 'Payment failed',
          status 
        });
      }
    }
    
    // Handle M-Pesa format
    const { Body } = req.body;
    if (Body && Body.stkCallback) {
      const resultCode = Body.stkCallback.ResultCode;
      const phoneNumber = Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value;
      
      if (resultCode === 0 && phoneNumber) {
        const policy = await InsurancePolicy.findOneAndUpdate(
          { status: 'pending', 'dependents.phoneNumber': phoneNumber },
          { 
            status: 'active', 
            startDate: new Date(), 
            endDate: new Date(Date.now() + 365*24*60*60*1000) 
          },
          { new: true }
        );
        
        if (policy) {
          return res.status(200).json({ 
            success: true, 
            message: 'M-Pesa payment processed successfully',
            policy: policy 
          });
        }
      }
    }
    
    res.status(400).json({ 
      error: 'Invalid callback format',
      received: req.body 
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment callback', 
      details: error.message 
    });
  }
}

module.exports = { initiateSTKPush, handleMpesaCallback }; 