export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have the required role',
        required: allowedRoles,
        yourRoles: userRoles
      });
    }
    
    next();
  };
};
