const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Record log after successful response
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const userId = req.user?.id || req.user?._id || req.user?.userId || 'ANONYMOUS';
          const userName = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.userId : 'Anonymous';
          const userRole = req.user?.role || 'Guest';
          const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

          let details = `Path: ${req.originalUrl} | Method: ${req.method}`;
          if (req.params && Object.keys(req.params).length > 0) {
            details += ` | Params: ${JSON.stringify(req.params)}`;
          }

          await AuditLog.create({
            userId,
            userName,
            userRole,
            action,
            resource,
            details,
            ipAddress,
            schoolId: req.user?.school || null,
          });
        } catch (err) {
          console.warn('Audit logger error:', err.message);
        }
      }
    });

    next();
  };
};

module.exports = auditLogger;
