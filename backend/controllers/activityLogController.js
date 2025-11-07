import db from '../models/index.js';
import { getActivityLogs } from '../services/activityLoggerService.js';

export const getLogs = async (req, res, next) => {
  try {
    const result = await getActivityLogs(req.query);
    
    res.json({
      success: true,
      logs: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserLogs = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is requesting their own logs or has permission
    if (userId !== req.user.id && !req.user.permissions.includes('logs.read')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these logs'
      });
    }

    const result = await getActivityLogs({
      ...req.query,
      userId
    });

    res.json({
      success: true,
      logs: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      }
    });
  } catch (error) {
    next(error);
  }
};
