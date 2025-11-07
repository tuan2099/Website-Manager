import db from '../models/index.js';

export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await db.Permission.findAll();
    res.json({
      success: true,
      permissions
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionsByResource = async (req, res, next) => {
  try {
    const permissions = await db.Permission.findAll();
    
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    next(error);
  }
};
