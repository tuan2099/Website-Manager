const { verifyAccessToken } = require('../utils/jwt');
const db = require('../database/models');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await db.User.findByPk(decoded.userId, {
      include: [{ model: db.Role, as: 'roles', include: [{ model: db.Permission, as: 'permissions' }] }],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User inactive or not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
