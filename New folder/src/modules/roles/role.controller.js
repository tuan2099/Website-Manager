const db = require('../../database/models');

async function listRoles(req, res) {
  const roles = await db.Role.findAll({
    include: [{ model: db.Permission, as: 'permissions', attributes: ['id', 'name'] }],
  });
  res.json(roles);
}

async function createRole(req, res) {
  const { name, description } = req.body;
  const role = await db.Role.create({ name, description });
  res.status(201).json(role);
}

async function updateRole(req, res) {
  const role = await db.Role.findByPk(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });

  const { name, description } = req.body;
  if (name !== undefined) role.name = name;
  if (description !== undefined) role.description = description;
  await role.save();

  res.json(role);
}

async function assignPermissions(req, res) {
  const role = await db.Role.findByPk(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });

  const { permissionIds } = req.body;
  const permissions = await db.Permission.findAll({ where: { id: permissionIds || [] } });
  await role.setPermissions(permissions);

  res.json({ message: 'Permissions updated' });
}

module.exports = {
  listRoles,
  createRole,
  updateRole,
  assignPermissions,
};
