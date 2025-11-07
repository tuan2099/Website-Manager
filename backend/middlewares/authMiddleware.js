import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }
    
    req.user = await user.getUserWithPermissions();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};
