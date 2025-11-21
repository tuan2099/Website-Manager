const service = require('./webhook.service');

async function listWebhooks(req, res) {
  const hooks = await service.listWebhooks();
  res.json(hooks);
}

async function createWebhook(req, res) {
  try {
    const hook = await service.createWebhook(req.body);
    res.status(201).json(hook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateWebhook(req, res) {
  try {
    const hook = await service.updateWebhook(req.params.id, req.body);
    if (!hook) return res.status(404).json({ message: 'Webhook not found' });
    res.json(hook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteWebhook(req, res) {
  const ok = await service.deleteWebhook(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Webhook not found' });
  res.json({ message: 'Webhook deleted' });
}

module.exports = {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
};
