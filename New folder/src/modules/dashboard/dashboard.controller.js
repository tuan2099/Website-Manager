const service = require('./dashboard.service');

async function getSummary(req, res) {
  const data = await service.getSummary();
  res.json(data);
}

module.exports = {
  getSummary,
};
