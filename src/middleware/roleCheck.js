const logger = require('../utils/logger');

/**
 * Middleware to check if user has required role(s)
 * This is a compatibility layer for routes that expect 'roleCheck' instead of 'requireRole'
 */
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logger.security('insufficient_role', req.user._id, {
        requiredRoles: allowedRoles,
        userRole,
        ip: req.ip,
        path: req.originalUrl,
        method: req.method
      });
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole
      });
    }

    next();
  };
};

module.exports = roleCheck;
