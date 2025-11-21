const { Op } = require('sequelize');
const db = require('../../database/models');

async function getSummary() {
  const now = new Date();
  const warnThresholdDays = 15;
  const warnDate = new Date(now.getTime() + warnThresholdDays * 24 * 60 * 60 * 1000);

  const totalWebsites = await db.Website.count();
  const offlineWebsites = await db.Website.count({ where: { status: 'offline' } });

  const sslExpiring = await db.Website.count({
    where: {
      monitoring_enabled: true,
      ssl_expiry_date: { [Op.ne]: null, [Op.lte]: warnDate },
    },
  });

  const domainExpiring = await db.Website.count({
    where: {
      monitoring_enabled: true,
      domain_expiry_date: { [Op.ne]: null, [Op.lte]: warnDate },
    },
  });

  const openAlerts = await db.WebsiteAlert.count({ where: { status: 'open' } });

  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const checks24h = await db.WebsiteCheck.count({
    where: {
      checked_at: { [Op.gte]: last24h },
    },
  });

  return {
    totalWebsites,
    offlineWebsites,
    sslExpiring,
    domainExpiring,
    openAlerts,
    checksLast24h: checks24h,
  };
}

module.exports = {
  getSummary,
};
