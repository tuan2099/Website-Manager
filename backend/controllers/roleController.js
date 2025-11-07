import db from '../models/index.js';
import { logActivity } from '../services/activityLoggerService.js';

export const getRoles = async (req, res, next) => {
  try {
    const roles = await db.Role.findAll({
      include: [{
        model: db.Permission,
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      roles
    });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name, slug, description, permissionIds } = req.body;
    const role = await db.Role.create({ name, slug, description });
    
    if (permissionIds) {
      await role.setPermissions(permissionIds);
    }
    
    await logActivity(req.user.id, 'create_role', 'roles', role.id, null, req);
    
    res.status(201).json({
      success: true,
      role: await role.reload({ include: [db.Permission] })
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await db.Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.update(req.body);
    await logActivity(req.user.id, 'update_role', 'roles', role.id, null, req);

    res.json({
      success: true,
      role: await role.reload({ include: [db.Permission] })
    });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissions = async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    const role = await db.Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.setPermissions(permissionIds);
    await logActivity(req.user.id, 'update_role_permissions', 'roles', role.id, { permissionIds }, req);

    res.json({
      success: true,
      role: await role.reload({ include: [db.Permission] })
    });
  } catch (error) {
    next(error);
  }
};
