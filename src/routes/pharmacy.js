const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');

// Import models
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');

// ==================== INVENTORY ROUTES ====================

// Get all inventory items for a pharmacy
router.get('/inventory', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  asyncHandler(async (req, res) => {
    try {
      const { page = 1, limit = 20, search, category, status } = req.query;
      const pharmacyId = req.user.facilityId || req.query.pharmacyId;
      
      if (!pharmacyId) {
        return res.status(400).json({ error: 'Pharmacy ID is required' });
      }

      const query = { pharmacyId };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) {
        query.category = category;
      }
      
      if (status) {
        query.status = status;
      }

      const inventory = await Inventory.find(query)
        .sort({ name: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('pharmacyId', 'name');

      const total = await Inventory.countDocuments(query);
      
      res.json({
        success: true,
        data: inventory,
        pagination: {
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDocs: total
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Create new inventory item
router.post('/inventory', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('medicationType').isIn(['tablet', 'capsule', 'liquid', 'injection', 'cream', 'other']).withMessage('Invalid medication type'),
    body('strength.value').isNumeric().withMessage('Strength value must be numeric'),
    body('currentStock').isNumeric().withMessage('Current stock must be numeric'),
    body('costPrice').isNumeric().withMessage('Cost price must be numeric'),
    body('sellingPrice').isNumeric().withMessage('Selling price must be numeric')
  ],
  asyncHandler(async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pharmacyId = req.user.facilityId || req.body.pharmacyId;
      if (!pharmacyId) {
        return res.status(400).json({ error: 'Pharmacy ID is required' });
      }

      const inventoryData = {
        ...req.body,
        pharmacyId,
        createdBy: req.user.id
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      res.status(201).json({ 
        success: true, 
        message: 'Inventory item created successfully',
        data: inventory 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Update stock levels
router.patch('/inventory/:id/stock', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  [
    body('quantity').isNumeric().withMessage('Quantity must be numeric'),
    body('type').isIn(['add', 'subtract']).withMessage('Type must be add or subtract')
  ],
  asyncHandler(async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const inventory = await Inventory.findById(req.params.id);
      if (!inventory) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      await inventory.updateStock(req.body.quantity, req.body.type);

      res.json({ 
        success: true, 
        message: 'Stock updated successfully',
        data: inventory 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// ==================== ORDER ROUTES ====================

// Get all orders for a pharmacy
router.get('/orders', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  asyncHandler(async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const pharmacyId = req.user.facilityId || req.query.pharmacyId;
      
      if (!pharmacyId) {
        return res.status(400).json({ error: 'Pharmacy ID is required' });
      }

      const query = { pharmacyId };
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('customer.patientId', 'name email');

      const total = await Order.countDocuments(query);
      
      res.json({
        success: true,
        data: orders,
        pagination: {
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDocs: total
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Create new order
router.post('/orders', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  [
    body('customer.patientId').isMongoId().withMessage('Valid patient ID is required'),
    body('customer.name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required')
  ],
  asyncHandler(async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pharmacyId = req.user.facilityId || req.body.pharmacyId;
      if (!pharmacyId) {
        return res.status(400).json({ error: 'Pharmacy ID is required' });
      }

      const orderData = {
        ...req.body,
        pharmacyId,
        createdBy: req.user.id
      };

      const order = new Order(orderData);
      await order.save();

      res.status(201).json({ 
        success: true, 
        message: 'Order created successfully',
        data: order 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// ==================== DASHBOARD ROUTES ====================

// Get pharmacy dashboard data
router.get('/dashboard', 
  auth, 
  roleCheck(['pharmacy', 'admin']), 
  asyncHandler(async (req, res) => {
    try {
      const pharmacyId = req.user.facilityId || req.query.pharmacyId;
      if (!pharmacyId) {
        return res.status(400).json({ error: 'Pharmacy ID is required' });
      }

      const totalInventory = await Inventory.countDocuments({ pharmacyId });
      const lowStockItems = await Inventory.countDocuments({ 
        pharmacyId, 
        currentStock: { $lte: '$minimumStock' } 
      });
      const totalOrders = await Order.countDocuments({ pharmacyId });
      const pendingOrders = await Order.countDocuments({ 
        pharmacyId, 
        status: { $in: ['pending', 'confirmed', 'processing'] } 
      });

      res.json({
        success: true,
        data: {
          counts: {
            inventory: { total: totalInventory, lowStock: lowStockItems },
            orders: { total: totalOrders, pending: pendingOrders }
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

module.exports = router;
