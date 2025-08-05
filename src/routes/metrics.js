const express = require('express');
const captchaMetrics = require('../services/captchaMetrics');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/metrics/captcha
// @desc    Get CAPTCHA security metrics (Admin only)
// @access  Private (Admin)
router.get('/captcha', authenticateToken, authorize('admin'), (req, res) => {
  try {
    const metrics = captchaMetrics.getMetrics();
    
    logger.audit('metrics_accessed', req.user._id, 'admin', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get CAPTCHA metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      code: 'METRICS_ERROR'
    });
  }
});

// @route   GET /api/v1/metrics/captcha/period
// @desc    Get CAPTCHA metrics for a specific time period (Admin only)
// @access  Private (Admin)
router.get('/captcha/period', authenticateToken, authorize('admin'), (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required',
        code: 'MISSING_DATES'
      });
    }

    const metrics = captchaMetrics.getMetricsForPeriod(startDate, endDate);
    
    logger.audit('metrics_period_accessed', req.user._id, 'admin', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        metrics
      }
    });
  } catch (error) {
    logger.error('Failed to get CAPTCHA period metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve period metrics',
      code: 'METRICS_ERROR'
    });
  }
});

// @route   GET /api/v1/metrics/captcha/prometheus
// @desc    Get CAPTCHA metrics in Prometheus format (Admin only)
// @access  Private (Admin)
router.get('/captcha/prometheus', authenticateToken, authorize('admin'), (req, res) => {
  try {
    const prometheusMetrics = captchaMetrics.exportMetrics();
    
    logger.audit('metrics_prometheus_accessed', req.user._id, 'admin', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    logger.error('Failed to export Prometheus metrics:', error);
    res.status(500).json({
      error: 'Failed to export metrics',
      code: 'METRICS_ERROR'
    });
  }
});

// @route   GET /api/v1/metrics/health
// @desc    Get system health metrics (Public)
// @access  Public
router.get('/health', (req, res) => {
  try {
    const metrics = captchaMetrics.getMetrics();
    
    // Calculate health indicators
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      indicators: {
        successRate: parseFloat(metrics.successRate),
        totalRequests: metrics.total.generated,
        failedRequests: metrics.total.failed,
        lockouts: metrics.total.lockouts,
        rateLimitViolations: metrics.total.rateLimitExceeded
      }
    };

    // Determine health status based on metrics
    if (metrics.total.generated > 0) {
      const successRate = parseFloat(metrics.successRate);
      if (successRate < 50) {
        health.status = 'warning';
        health.message = 'Low CAPTCHA success rate detected';
      } else if (successRate < 30) {
        health.status = 'critical';
        health.message = 'Very low CAPTCHA success rate - possible attack';
      }
    }

    if (metrics.total.lockouts > 100) {
      health.status = 'warning';
      health.message = 'High number of lockouts detected';
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Failed to get health metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve health metrics',
      code: 'METRICS_ERROR'
    });
  }
});

module.exports = router; 