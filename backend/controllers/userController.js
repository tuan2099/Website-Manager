import db from '../models/index.js';
import { logActivity } from '../services/activityLoggerService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, role } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) where.status = status;
    
    const users = await db.User.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      include: [{
        model: db.Role,
        where: role ? { slug: role } : undefined,
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      data: await Promise.all(users.rows.map(user => user.getUserWithPermissions())),
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await db.User.create(req.body);
    if (req.body.roleIds) {
      await user.setRoles(req.body.roleIds);
    }
    
    await logActivity(req.user.id, 'create_user', 'users', user.id, null, req);
    
    res.status(201).json({
      success: true,
      user: await user.getUserWithPermissions()
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(req.body);
    await logActivity(req.user.id, 'update_user', 'users', user.id, null, req);

    res.json({
      success: true,
      user: await user.getUserWithPermissions()
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();
    await logActivity(req.user.id, 'delete_user', 'users', req.params.id, null, req);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
