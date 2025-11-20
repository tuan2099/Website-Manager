const crypto = require('crypto');
const db = require('../../database/models');

async function listTokens(userId) {
  return db.ApiToken.findAll({ where: { user_id: userId } });
}

async function createToken(userId, description) {
  const token = crypto.randomBytes(32).toString('hex');
  const apiToken = await db.ApiToken.create({
    user_id: userId,
    token,
    description,
  });
  return apiToken;
}

async function revokeToken(userId, id) {
  const token = await db.ApiToken.findOne({ where: { id, user_id: userId } });
  if (!token) return false;
  token.is_active = false;
  await token.save();
  return true;
}

module.exports = {
  listTokens,
  createToken,
  revokeToken,
};
