const db = require('../../database/models');

async function listWebhooks() {
  return db.Webhook.findAll();
}

async function createWebhook(data) {
  const webhook = await db.Webhook.create({
    website_id: data.website_id || null,
    url: data.url,
    event: data.event,
    secret: data.secret,
  });
  return webhook;
}

async function updateWebhook(id, data) {
  const webhook = await db.Webhook.findByPk(id);
  if (!webhook) return null;

  Object.assign(webhook, {
    url: data.url ?? webhook.url,
    event: data.event ?? webhook.event,
    secret: data.secret ?? webhook.secret,
    is_active: typeof data.is_active === 'boolean' ? data.is_active : webhook.is_active,
  });

  await webhook.save();
  return webhook;
}

async function deleteWebhook(id) {
  const webhook = await db.Webhook.findByPk(id);
  if (!webhook) return false;
  await webhook.destroy();
  return true;
}

module.exports = {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
};
