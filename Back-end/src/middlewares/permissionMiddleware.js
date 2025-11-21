function requirePermission(permissionName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const permissions = new Set();

    (req.user.roles || []).forEach((role) => {
      (role.permissions || []).forEach((perm) => {
        permissions.add(perm.name);
      });
    });

    if (!permissions.has(permissionName)) {
      return res.status(403).json({ message: 'Forbidden: missing permission ' + permissionName });
    }

    next();
  };
}

module.exports = requirePermission;
