const { v4: uuidv4 } = require('uuid');

function requestIdMiddleware(req, res, next) {
  const requestId = uuidv4();
  req.requestId = requestId;
  res.locals.requestId = requestId;
  // Optionally add to response headers for client traceability
  res.setHeader('X-Request-Id', requestId);
  next();
}

module.exports = requestIdMiddleware; 