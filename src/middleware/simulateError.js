// Simulated error middleware for QA/testing
// Usage: Add ?simulateError=true to any request to trigger a test error
function simulateErrorMiddleware(req, res, next) {
  if (req.query.simulateError === 'true') {
    const err = new Error('Simulated error for QA testing');
    err.statusCode = 418; // I'm a teapot (for easy identification)
    return next(err);
  }
  next();
}

module.exports = simulateErrorMiddleware; 