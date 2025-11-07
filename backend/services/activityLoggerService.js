import db from '../models/index.js';

export const logActivity = async (userId, action, resource = null, resourceId = null, details = null, req = null) => {
  try {
    await db.ActivityLog.create({
      userId,
      action,
      resource,
      resourceId,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers['user-agent'] || null,
      details: details ? JSON.stringify(details) : null
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getActivityLogs = async (query) => {
  const { page = 1, limit = 20, userId, action, resource, startDate, endDate } = query;
  
  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = startDate;
    if (endDate) where.createdAt[Op.lte] = endDate;
  }

  return await db.ActivityLog.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
    include: [{
      model: db.User,
      attributes: ['username', 'email']
    }]
  });
};
