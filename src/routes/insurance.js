const express = require('express');
const router = express.Router();
const InsurancePolicy = require('../models/InsurancePolicy');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { BlockchainService } = require('../services/blockchainService');
const BlockchainLog = require('../models/BlockchainLog');

// POST /api/v1/insurance - Enroll a user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { policyTier, premiumAmount, coverageLimit, dependents } = req.body;
    const userId = req.user._id;
    const policy = new InsurancePolicy({
      userId,
      policyTier,
      premiumAmount,
      coverageLimit,
      dependents,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await policy.save();
    // --- Blockchain Integration ---
    try {
      const blockchainService = new BlockchainService();
      const blockchainResult = await blockchainService.recordEvent({
        eventType: 'InsuranceEnrollment',
        entityId: policy._id.toString(),
        dataHash: policy._id.toString() // You may want to hash more data for privacy
      });
      policy.transactionHash = blockchainResult.transactionHash;
      policy.blockNumber = blockchainResult.blockNumber;
      policy.blockchainTimestamp = new Date();
      policy.isVerified = false;
      policy.verificationAttempts = 0;
      await policy.save();
      // Log to BlockchainLog
      await BlockchainLog.create({
        type: 'insurance_enrollment',
        entityId: policy._id.toString(),
        description: `Insurance policy ${policy._id} enrolled and recorded on blockchain`,
        transactionHash: blockchainResult.transactionHash,
        status: 'recorded',
        recordedBy: req.user.fullName || req.user.email,
        additionalInfo: { policyTier: policy.policyTier, premiumAmount: policy.premiumAmount, coverageLimit: policy.coverageLimit }
      });
    } catch (blockchainError) {
      // Optionally: log or return warning
    }
    // --- End Blockchain Integration ---
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll user', details: error.message });
  }
});

// GET /api/v1/insurance/user/:userId - Get user's policy
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const policy = await InsurancePolicy.findOne({ userId });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy', details: error.message });
  }
});

// PATCH /api/v1/insurance/:policyId/status - Update policy status (admin only)
router.patch('/:policyId/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { policyId } = req.params;
    const { status } = req.body;
    const policy = await InsurancePolicy.findByIdAndUpdate(policyId, { status, updatedAt: new Date() }, { new: true });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    // --- Blockchain Integration ---
    try {
      const blockchainService = new BlockchainService();
      const blockchainResult = await blockchainService.recordEvent({
        eventType: 'InsuranceStatusUpdate',
        entityId: policy._id.toString(),
        dataHash: policy._id.toString() + ':' + status
      });
      policy.transactionHash = blockchainResult.transactionHash;
      policy.blockNumber = blockchainResult.blockNumber;
      policy.blockchainTimestamp = new Date();
      policy.isVerified = false;
      policy.verificationAttempts = 0;
      await policy.save();
      // Log to BlockchainLog
      await BlockchainLog.create({
        type: 'insurance_status_update',
        entityId: policy._id.toString(),
        description: `Insurance policy ${policy._id} status updated to ${status} and recorded on blockchain`,
        transactionHash: blockchainResult.transactionHash,
        status: 'recorded',
        recordedBy: req.user.fullName || req.user.email,
        additionalInfo: { status }
      });
    } catch (blockchainError) {
      // Optionally: log or return warning
    }
    // --- End Blockchain Integration ---
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy status', details: error.message });
  }
});

// PATCH /api/v1/insurance/:policyId/verify-blockchain - Verify policy's blockchain status (admin)
router.patch('/:policyId/verify-blockchain', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { policyId } = req.params;
    const policy = await InsurancePolicy.findById(policyId);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    if (!policy.transactionHash) return res.status(400).json({ error: 'No transaction hash found for this policy.' });
    const blockchainService = new BlockchainService();
    const verification = await blockchainService.verifyEvent(policy.transactionHash);
    policy.isVerified = verification.isVerified;
    policy.verificationAttempts = (policy.verificationAttempts || 0) + 1;
    policy.blockNumber = verification.blockNumber;
    policy.blockchainTimestamp = new Date();
    await policy.save();
    // Log to BlockchainLog
    await BlockchainLog.create({
      type: 'verification',
      entityId: policy._id.toString(),
      description: `Verification for insurance policy ${policy._id} on blockchain`,
      transactionHash: policy.transactionHash,
      status: verification.isVerified ? 'verified' : 'failed',
      recordedBy: req.user.fullName || req.user.email,
      additionalInfo: { policyTier: policy.policyTier, premiumAmount: policy.premiumAmount, coverageLimit: policy.coverageLimit }
    });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify policy on blockchain', details: error.message });
  }
});

// POST /api/v1/insurance/expert-request - Request to speak to an insurance expert
router.post('/expert-request', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    // In a real app, this would notify an admin/expert or create a support ticket
    // For now, just return a mock response
    res.status(200).json({
      success: true,
      message: 'Your request to speak to an expert has been received. An expert will contact you soon.',
      data: { name, email, phone, message }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit expert request', details: error.message });
  }
});

// POST /api/v1/insurance/quote - Request a quote for a policy
router.post('/quote', authenticateToken, async (req, res) => {
  try {
    const { policyId, name, email, phone, message } = req.body;
    // In a real app, this would notify an admin/insurance rep or create a quote request
    // For now, just return a mock response
    res.status(200).json({
      success: true,
      message: 'Your quote request has been received. An insurance representative will contact you soon.',
      data: { policyId, name, email, phone, message }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quote request', details: error.message });
  }
});

// GET /api/v1/insurance/policy/:policyId - Get detailed info about a policy
router.get('/policy/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    // In a real app, fetch policy details from DB
    // For now, return mock details
    res.status(200).json({
      success: true,
      data: {
        policyId,
        name: 'Mock Policy Name',
        description: 'This is a detailed description of the insurance policy.',
        premium: 12000,
        coverage: 1000000,
        deductible: 2000,
        features: ['Inpatient', 'Outpatient', 'Dental', 'Vision', 'Maternity'],
        waitingPeriod: 30,
        maxAge: 65,
        exclusions: ['Pre-existing conditions (first year)', 'Cosmetic surgery'],
        provider: 'Mock Insurance Company',
        contact: {
          phone: '+254 700 000 000',
          email: 'info@mockinsurance.co.ke',
          website: 'www.mockinsurance.co.ke'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy details', details: error.message });
  }
});

// PATCH /api/v1/insurance/compare - Improved mock comparison
router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { policyIds } = req.body;
    if (!Array.isArray(policyIds) || policyIds.length < 2) {
      return res.status(400).json({ error: 'Please provide at least two policy IDs to compare.' });
    }
    // Improved mock: Return more realistic comparison
    const details = policyIds.map((id, idx) => ({
      policyId: id,
      name: `Mock Policy ${id}`,
      premium: 10000 + idx * 2000,
      coverage: 500000 + idx * 250000,
      deductible: 2000 - idx * 200,
      features: ['Inpatient', 'Outpatient', idx % 2 === 0 ? 'Dental' : 'Vision'],
      score: 80 + idx * 5,
      notes: 'Mock policy comparison details.'
    }));
    res.status(200).json({
      success: true,
      data: {
        comparedPolicies: policyIds,
        summary: 'Comparison complete. (This is a mock response.)',
        details
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare policies', details: error.message });
  }
});

module.exports = router; 