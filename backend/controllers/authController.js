import * as authService from '../services/authService.js';
import * as emailService from '../services/emailService.js';
import { logActivity } from '../services/activityLoggerService.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    await emailService.sendWelcomeEmail(user.email, user.fullName);
    await logActivity(user.id, 'register', 'auth', null, null, req);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: await user.getUserWithPermissions()
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user.id, refreshToken);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
