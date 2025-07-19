const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const InsurancePolicy = require('../models/InsurancePolicy');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { recordClaim } = require('../services/blockchainService');

// POST /api/v1/claims - Submit a claim
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { policyId, patientId, facilityId, claimAmount, servicesRendered } = req.body;
    const claim = new Claim({
      policyId,
      patientId,
      facilityId,
      claimAmount,
      servicesRendered,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await claim.save();
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit claim', details: error.message });
  }
});

// GET /api/v1/claims/patient/:patientId - Get patient's claim history
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const claims = await Claim.find({ patientId });
    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims', details: error.message });
  }
});

// GET /api/v1/claims - List all claims (admin)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const claims = await Claim.find(filter);
    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all claims', details: error.message });
  }
});

// PATCH /api/v1/claims/:claimId/process - Approve or reject a claim (admin)
router.patch('/:claimId/process', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, rejectionReason } = req.body;
    let update = { status, updatedAt: new Date() };
    if (status === 'rejected') update.rejectionReason = rejectionReason;
    if (status === 'approved') {
      // Record on blockchain
      const claim = await Claim.findById(claimId);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
      const txHash = await recordClaim({
        policyId: claim.policyId,
        patientId: claim.patientId,
        facilityId: claim.facilityId,
        claimAmount: claim.claimAmount
      });
      update.transactionHash = txHash;
    }
    const claim = await Claim.findByIdAndUpdate(claimId, update, { new: true });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process claim', details: error.message });
  }
});

module.exports = router; 