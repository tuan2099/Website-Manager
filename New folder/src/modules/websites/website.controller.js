const websiteService = require('./website.service');

async function createWebsite(req, res) {
  try {
    const data = {
      name: req.body.name,
      domain: req.body.domain,
      status: req.body.status,
      ssl_expiry_date: req.body.ssl_expiry_date,
      domain_expiry_date: req.body.domain_expiry_date,
      registrar: req.body.registrar,
      hosting_provider: req.body.hosting_provider,
      hosting_plan: req.body.hosting_plan,
      server_ip: req.body.server_ip,
      monitoring_enabled: req.body.monitoring_enabled,
      last_backup_at: req.body.last_backup_at,
      backup_provider: req.body.backup_provider,
      backup_notes: req.body.backup_notes,
      notes: req.body.notes,
    };

    const website = await websiteService.createWebsite(data, req.user.id);
    res.status(201).json(website);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listWebsites(req, res) {
  const { status, owner_user_id, search } = req.query;
  const websites = await websiteService.listWebsites({
    status,
    owner_user_id,
    search,
  });
  res.json(websites);
}

async function getWebsite(req, res) {
  const website = await websiteService.getWebsiteDetail(req.params.id);
  if (!website) return res.status(404).json({ message: 'Website not found' });
  res.json(website);
}

async function updateWebsite(req, res) {
  const data = {
    name: req.body.name,
    domain: req.body.domain,
    status: req.body.status,
    ssl_expiry_date: req.body.ssl_expiry_date,
    domain_expiry_date: req.body.domain_expiry_date,
    registrar: req.body.registrar,
    hosting_provider: req.body.hosting_provider,
    hosting_plan: req.body.hosting_plan,
    server_ip: req.body.server_ip,
    monitoring_enabled: req.body.monitoring_enabled,
    last_backup_at: req.body.last_backup_at,
    backup_provider: req.body.backup_provider,
    backup_notes: req.body.backup_notes,
    notes: req.body.notes,
  };

  const website = await websiteService.updateWebsite(req.params.id, data);
  if (!website) return res.status(404).json({ message: 'Website not found' });
  res.json(website);
}

async function deleteWebsite(req, res) {
  const ok = await websiteService.deleteWebsite(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Website not found' });
  res.json({ message: 'Deleted' });
}

async function checkNow(req, res) {
  try {
    const { check_type } = req.body; // optional, default ssl
    const check = await websiteService.checkNow(req.params.id, { check_type });
    if (!check) return res.status(404).json({ message: 'Website not found' });
    res.status(201).json(check);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listChecks(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await websiteService.listChecks(req.params.id, page, limit);
  res.json(result);
}

async function getStats(req, res) {
  const range = req.query.range === '24h' ? '24h' : '1h';
  const stats = await websiteService.getStats(req.params.id, range);
  if (!stats) return res.status(404).json({ message: 'Website not found' });
  res.json(stats);
}

async function listDnsRecords(req, res) {
  const result = await websiteService.listDnsRecords(req.params.id);
  if (!result) return res.status(404).json({ message: 'Website not found' });
  res.json(result.records);
}

async function createDnsRecord(req, res) {
  const record = await websiteService.createDnsRecord(req.params.id, req.body);
  if (!record) return res.status(404).json({ message: 'Website not found' });
  res.status(201).json(record);
}

async function updateDnsRecord(req, res) {
  const record = await websiteService.updateDnsRecord(req.params.id, req.params.recordId, req.body);
  if (!record) return res.status(404).json({ message: 'DNS record not found' });
  res.json(record);
}

async function deleteDnsRecord(req, res) {
  const ok = await websiteService.deleteDnsRecord(req.params.id, req.params.recordId);
  if (!ok) return res.status(404).json({ message: 'DNS record not found' });
  res.json({ message: 'DNS record deleted' });
}

async function addWebsiteMember(req, res) {
  try {
    const member = await websiteService.addWebsiteMember(
      req.params.id,
      req.body.user_id,
      req.body.permission
    );
    if (!member) return res.status(404).json({ message: 'Website or user not found' });
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function removeWebsiteMember(req, res) {
  const ok = await websiteService.removeWebsiteMember(req.params.id, req.params.userId);
  if (!ok) return res.status(404).json({ message: 'Website member not found' });
  res.json({ message: 'Website member removed' });
}

module.exports = {
  createWebsite,
  listWebsites,
  getWebsite,
  updateWebsite,
  deleteWebsite,
  checkNow,
  listChecks,
  getStats,
  listDnsRecords,
  createDnsRecord,
  updateDnsRecord,
  deleteDnsRecord,
  addWebsiteMember,
  removeWebsiteMember,
};
