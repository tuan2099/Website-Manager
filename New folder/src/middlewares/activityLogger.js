const db = require('../database/models');

async function activityLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      if (!req.user) return;

      const endpoint = req.originalUrl || req.url;
      const method = req.method;
      const ip = req.ip || req.connection?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      let payloadSummary = null;
      if (req.body && Object.keys(req.body).length > 0) {
        const clone = { ...req.body };
        if (clone.password) clone.password = '***';
        if (clone.newPassword) clone.newPassword = '***';
        if (clone.oldPassword) clone.oldPassword = '***';
        payloadSummary = JSON.stringify(clone).slice(0, 1000);
      }

      await db.ActivityLog.create({
        user_id: req.user.id,
        endpoint,
        method,
        payload: payloadSummary,
        ip,
        user_agent: userAgent,
      });
    } catch (err) {
      // silent fail for logging to not break main flow
      console.error('Failed to log activity', err.message);
    }
  });

  next();
}

module.exports = activityLogger;
