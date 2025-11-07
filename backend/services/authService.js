import db from '../models/index.js';
import { generateAccessToken, generateRefreshToken } from './tokenService.js';
import { logActivity } from './activityLoggerService.js';

export const register = async (userData) => {
  const user = await db.User.create(userData);
  const defaultRole = await db.Role.findOne({ where: { slug: 'viewer' } });
  await user.addRole(defaultRole);
  return user;
};

export const login = async (email, password) => {
  const user = await db.User.findOne({ 
    where: { email }
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  await user.update({ lastLogin: new Date() });
  await logActivity(user.id, 'login');

  return {
    accessToken,
    refreshToken,
    user: await user.getUserWithPermissions()
  };
};

export const logout = async (userId, refreshToken) => {
  await db.RefreshToken.destroy({ where: { userId, token: refreshToken } });
  await logActivity(userId, 'logout');
  return true;
};

export const refreshAccessToken = async (refreshToken) => {
  const tokenRecord = await db.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [db.User]
  });

  if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
    throw new Error('Invalid or expired refresh token');
  }

  const accessToken = generateAccessToken(tokenRecord.User.id);
  return { accessToken };
};
