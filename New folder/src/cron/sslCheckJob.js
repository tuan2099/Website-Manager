const cron = require('node-cron');
const db = require('../database/models');

function registerSslCheckJob() {
  // Chạy mỗi ngày lúc 01:00 sáng
  cron.schedule('0 1 * * *', async () => {
    const now = new Date();

    const websites = await db.Website.findAll({
      where: {
        ssl_expiry_date: { [db.Sequelize.Op.ne]: null },
        monitoring_enabled: true,
      },
    });

    for (const website of websites) {
      if (!website.ssl_expiry_date) continue;

      const diffMs = website.ssl_expiry_date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        const message = `SSL will expire in ${diffDays} days`;

        await db.WebsiteCheck.create({
          website_id: website.id,
          check_type: 'ssl',
          status: 'warning',
          message,
          raw_data: null,
          checked_at: now,
        });

        await db.ActivityLog.create({
          user_id: null, // hệ thống
          endpoint: 'cron:ssl-expiry-check',
          method: 'SYSTEM',
          payload: JSON.stringify({ domain: website.domain, days: diffDays }).slice(0, 1000),
          ip: null,
          user_agent: 'cron-job',
        });
      }
    }
  });
}

module.exports = { registerSslCheckJob };
