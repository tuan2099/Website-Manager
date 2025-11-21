const db = require('../../database/models');

async function listPermissions(req, res) {
  const permissions = await db.Permission.findAll();
  res.json(permissions);
}

async function createPermission(req, res) {
  const { name, description } = req.body;
  const perm = await db.Permission.create({ name, description });
  res.status(201).json(perm);
}

async function updatePermission(req, res) {
  const perm = await db.Permission.findByPk(req.params.id);
  if (!perm) return res.status(404).json({ message: 'Permission not found' });

  const { name, description } = req.body;
  if (name !== undefined) perm.name = name;
  if (description !== undefined) perm.description = description;
  await perm.save();

  res.json(perm);
}

module.exports = {
  listPermissions,
  createPermission,
  updatePermission,
};
