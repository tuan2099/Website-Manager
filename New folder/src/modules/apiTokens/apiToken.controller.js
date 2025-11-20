const service = require('./apiToken.service');

async function listTokens(req, res) {
  const tokens = await service.listTokens(req.user.id);
  res.json(tokens);
}

async function createToken(req, res) {
  try {
    const token = await service.createToken(req.user.id, req.body.description);
    res.status(201).json(token);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function revokeToken(req, res) {
  const ok = await service.revokeToken(req.user.id, req.params.id);
  if (!ok) return res.status(404).json({ message: 'Token not found' });
  res.json({ message: 'Token revoked' });
}

module.exports = {
  listTokens,
  createToken,
  revokeToken,
};
