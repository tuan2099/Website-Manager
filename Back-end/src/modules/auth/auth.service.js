const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const db = require('../../database/models');

const SALT_ROUNDS = 10;

async function register({ email, password, name }) {
  const existing = await db.User.findOne({ where: { email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await db.User.create({
    email,
    password_hash: passwordHash,
    name,
  });

  return user;
}

async function login({ email, password }) {
  const user = await db.User.findOne({ where: { email, is_active: true } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const payload = { userId: user.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const decoded = verifyRefreshToken(refreshToken);

  await db.RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(decoded.exp * 1000),
  });

  return { user, accessToken, refreshToken };
}

async function logout({ refreshToken }) {
  await db.RefreshToken.destroy({ where: { token: refreshToken } });
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const stored = await db.RefreshToken.findOne({ where: { token: refreshToken } });
  if (!stored) {
    throw new Error('Invalid refresh token');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    await db.RefreshToken.destroy({ where: { token: refreshToken } });
    throw new Error('Expired refresh token');
  }

  const payload = { userId: decoded.userId };
  const accessToken = signAccessToken(payload);

  return { accessToken };
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const match = await bcrypt.compare(oldPassword, user.password_hash);
  if (!match) {
    throw new Error('Old password incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password_hash = newHash;
  await user.save();
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  changePassword,
};
