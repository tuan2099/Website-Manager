const db = require('../../database/models');
const { Op } = require('sequelize');

async function createWebsite(data, ownerUserId) {
  const website = await db.Website.create({
    ...data,
    owner_user_id: ownerUserId,
  });
  return website;
}

async function exportWebsites(filters = {}) {
  const items = await listWebsites(filters);
  return items;
}

async function importWebsites(payload, ownerUserId) {
  if (!Array.isArray(payload)) {
    throw new Error('Payload must be an array');
  }

  const created = [];
  for (const item of payload) {
    const data = {
      name: item.name,
      domain: item.domain,
      status: item.status,
      ssl_expiry_date: item.ssl_expiry_date,
      domain_expiry_date: item.domain_expiry_date,
      registrar: item.registrar,
      hosting_provider: item.hosting_provider,
      hosting_plan: item.hosting_plan,
      server_ip: item.server_ip,
      monitoring_enabled: item.monitoring_enabled ?? true,
      last_backup_at: item.last_backup_at,
      backup_provider: item.backup_provider,
      backup_notes: item.backup_notes,
      notes: item.notes,
    };

    const website = await db.Website.create({
      ...data,
      owner_user_id: ownerUserId,
    });

    created.push(website);
  }

  return created;
}

async function listDnsRecords(websiteId) {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  const records = await db.WebsiteDnsRecord.findAll({
    where: { website_id: websiteId },
    order: [['record_type', 'ASC'], ['host', 'ASC']],
  });

  return { website, records };
}

async function createDnsRecord(websiteId, payload) {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  const record = await db.WebsiteDnsRecord.create({
    website_id: websiteId,
    record_type: payload.record_type,
    host: payload.host,
    value: payload.value,
    ttl: payload.ttl,
    priority: payload.priority,
    notes: payload.notes,
  });

  return record;
}

async function updateDnsRecord(websiteId, recordId, payload) {
  const record = await db.WebsiteDnsRecord.findOne({
    where: {
      id: recordId,
      website_id: websiteId,
    },
  });

  if (!record) return null;

  Object.assign(record, {
    record_type: payload.record_type ?? record.record_type,
    host: payload.host ?? record.host,
    value: payload.value ?? record.value,
    ttl: payload.ttl ?? record.ttl,
    priority: payload.priority ?? record.priority,
    notes: payload.notes ?? record.notes,
  });

  await record.save();
  return record;
}

async function deleteDnsRecord(websiteId, recordId) {
  const deleted = await db.WebsiteDnsRecord.destroy({
    where: {
      id: recordId,
      website_id: websiteId,
    },
  });

  return deleted > 0;
}

async function assignTeam(websiteId, teamId) {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  if (teamId) {
    const team = await db.Team.findByPk(teamId);
    if (!team) throw new Error('Team not found');
  }

  website.team_id = teamId || null;
  await website.save();
  return website;
}

async function addWebsiteMember(websiteId, userId, permission = 'view') {
  const website = await db.Website.findByPk(websiteId);
  const user = await db.User.findByPk(userId);
  if (!website || !user) return null;

  const [member] = await db.WebsiteMember.findOrCreate({
    where: { website_id: websiteId, user_id: userId },
    defaults: { permission },
  });

  if (member.permission !== permission) {
    member.permission = permission;
    await member.save();
  }

  return member;
}

async function removeWebsiteMember(websiteId, userId) {
  const deleted = await db.WebsiteMember.destroy({
    where: { website_id: websiteId, user_id: userId },
  });

  return deleted > 0;
}

async function listWebsites(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.owner_user_id) {
    where.owner_user_id = filters.owner_user_id;
  }

  if (filters.team_id) {
    where.team_id = filters.team_id;
  }

  if (typeof filters.monitoring_enabled === 'boolean') {
    where.monitoring_enabled = filters.monitoring_enabled;
  }

  if (filters.registrar) {
    where.registrar = filters.registrar;
  }

  if (filters.hosting_provider) {
    where.hosting_provider = filters.hosting_provider;
  }

  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { domain: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const include = [];

  if (filters.tag) {
    include.push({
      model: db.Tag,
      as: 'tags',
      where: { name: filters.tag },
      through: { attributes: [] },
      required: true,
    });
  } else {
    include.push({
      model: db.Tag,
      as: 'tags',
      through: { attributes: [] },
      required: false,
    });
  }

  const websites = await db.Website.findAll({ where, include });
  return websites;
}

async function addTagToWebsite(websiteId, tagName, color) {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  const [tag] = await db.Tag.findOrCreate({
    where: { name: tagName },
    defaults: { color },
  });

  await db.WebsiteTag.findOrCreate({
    where: { website_id: websiteId, tag_id: tag.id },
  });

  return tag;
}

async function removeTagFromWebsite(websiteId, tagId) {
  const deleted = await db.WebsiteTag.destroy({
    where: { website_id: websiteId, tag_id: tagId },
  });

  return deleted > 0;
}

async function getWebsiteDetail(id) {
  const website = await db.Website.findByPk(id, {
    include: [
      {
        model: db.WebsiteCheck,
        as: 'checks',
        limit: 3,
        order: [['checked_at', 'DESC']],
      },
    ],
  });
  return website;
}

async function updateWebsite(id, data) {
  const website = await db.Website.findByPk(id);
  if (!website) return null;

  Object.assign(website, data);
  await website.save();
  return website;
}

async function deleteWebsite(id) {
  const website = await db.Website.findByPk(id);
  if (!website) return false;
  await website.destroy(); // hard delete; có thể đổi thành soft delete sau
  return true;
}

// Stub logic: kiểm tra website (ssl/uptime) giả lập.
// Sau này có thể thay bằng gọi HTTP thực sự, kiểm tra chứng chỉ SSL, v.v.
async function checkNow(websiteId, options = {}) {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  const checkType = options.check_type || 'ssl';

  // STUB: logic kiểm tra giả lập
  const now = new Date();
  let status = 'ok';
  let message = 'Check passed (stub)';

  if (checkType === 'ssl' && website.ssl_expiry_date) {
    const diffMs = website.ssl_expiry_date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      status = 'error';
      message = 'SSL certificate expired (stub)';
    } else if (diffDays <= 15) {
      status = 'warning';
      message = `SSL will expire in ${diffDays} days (stub)`;
    }
  }

  const check = await db.WebsiteCheck.create({
    website_id: website.id,
    check_type: checkType,
    status,
    message,
    raw_data: null,
    checked_at: now,
  });

  // Cập nhật status website đơn giản theo kết quả check
  if (status === 'ok') website.status = 'online';
  if (status === 'warning') website.status = 'degraded';
  if (status === 'error') website.status = 'offline';
  await website.save();

  return check;
}

async function listChecks(websiteId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { rows, count } = await db.WebsiteCheck.findAndCountAll({
    where: { website_id: websiteId },
    order: [['checked_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

async function getStats(websiteId, range = '1h') {
  const website = await db.Website.findByPk(websiteId);
  if (!website) return null;

  const now = new Date();
  let durationMs = 60 * 60 * 1000; // default 1h

  if (range === '24h') {
    durationMs = 24 * 60 * 60 * 1000;
  }

  const since = new Date(now.getTime() - durationMs);

  const checks = await db.WebsiteCheck.findAll({
    where: {
      website_id: websiteId,
      check_type: 'uptime',
      checked_at: { [Op.gte]: since },
    },
  });

  if (!checks.length) {
    return {
      websiteId,
      range,
      avg_response_time_ms: null,
      total: 0,
      status_counts: { ok: 0, warning: 0, error: 0 },
    };
  }

  const responseTimes = checks
    .map((c) => c.response_time_ms)
    .filter((v) => typeof v === 'number');

  const avgResponseTime = responseTimes.length
    ? Math.round(responseTimes.reduce((sum, v) => sum + v, 0) / responseTimes.length)
    : null;

  const statusCounts = checks.reduce(
    (acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    },
    { ok: 0, warning: 0, error: 0 }
  );

  return {
    websiteId,
    range,
    avg_response_time_ms: avgResponseTime,
    total: checks.length,
    status_counts: statusCounts,
    since,
    until: now,
  };
}

module.exports = {
  createWebsite,
  listWebsites,
  getWebsiteDetail,
  updateWebsite,
  deleteWebsite,
  checkNow,
  listChecks,
  getStats,
  exportWebsites,
  importWebsites,
  listDnsRecords,
  createDnsRecord,
  updateDnsRecord,
  deleteDnsRecord,
  assignTeam,
  addWebsiteMember,
  removeWebsiteMember,
  addTagToWebsite,
  removeTagFromWebsite,
};
