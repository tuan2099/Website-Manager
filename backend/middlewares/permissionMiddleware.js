import { logActivity } from '../services/activityLoggerService.js';

// Simple in-memory cache for permissions
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Permission hierarchy definitions
const permissionHierarchy = {
  'admin': ['create', 'read', 'update', 'delete'],
  'editor': ['create', 'read', 'update'],
  'viewer': ['read']
};

// Rate limiting per permission
const rateLimits = new Map();
const RATE_WINDOW = 60 * 1000; // 1 minute
const DEFAULT_RATE_LIMIT = 100;

const permissionRateLimits = {
  'users.create': 10,    // 10 user creations per minute
  'users.delete': 5,     // 5 user deletions per minute
  'settings.update': 20  // 20 setting updates per minute
};

export const checkPermission = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const requiredPermission = `${resource}.${action}`;
      
      // Check rate limit
      const rateKey = `${req.user.id}-${requiredPermission}`;
      const now = Date.now();
      const userRateLimit = rateLimits.get(rateKey) || { count: 0, timestamp: now };
      
      if (now - userRateLimit.timestamp > RATE_WINDOW) {
        userRateLimit.count = 0;
        userRateLimit.timestamp = now;
      }
      
      const limit = permissionRateLimits[requiredPermission] || DEFAULT_RATE_LIMIT;
      if (userRateLimit.count >= limit) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded for this permission',
          retryAfter: Math.ceil((userRateLimit.timestamp + RATE_WINDOW - now) / 1000)
        });
      }
      
      // Super admin bypass
      if (req.user.roles.includes('super_admin')) {
        return next();
      }

      // Check permission
      const hasPermission = req.user.permissions.includes(requiredPermission);
      
      // Check hierarchical permissions
      const hasHierarchicalPermission = req.user.roles.some(role => {
        const allowedActions = permissionHierarchy[role] || [];
        return allowedActions.includes(action);
      });

      hasPermission = hasPermission || hasHierarchicalPermission;

      // Cache the result
      permissionCache.set(`${req.user.id}-${requiredPermission}`, {
        hasPermission,
        timestamp: Date.now()
      });

      // Check ownership if specified
      if (!hasPermission && options.allowOwner) {
        const resourceId = req.params[options.ownerParam || 'id'];
        const resourceModel = options.model;
        
        if (resourceId && resourceModel) {
          const resource = await resourceModel.findByPk(resourceId);
          if (resource?.userId === req.user.id) {
            return next();
          }
        }
      }

      // Async logging
      setImmediate(() => {
        logActivity(req.user.id, 'permission_check', 'permissions', null, {
          permission: requiredPermission,
          granted: hasPermission,
          path: req.path,
          method: req.method
        });
      });

      if (!hasPermission) {
        // Enhanced logging
        const logData = {
          userId: req.user.id,
          username: req.user.username,
          requiredPermission,
          userRoles: req.user.roles,
          userPermissions: req.user.permissions,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        };
        console.log('Permission denied:', JSON.stringify(logData, null, 2));

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          required: requiredPermission,
          userPermissions: req.user.permissions,
          resource,
          action,
          suggestedRole: getSuggestedRole(action)
        });
      }
      
      // Update rate limit counter
      userRateLimit.count++;
      rateLimits.set(rateKey, userRateLimit);
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      permissionCache.delete(`${req.user.id}-${resource}.${action}`);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Helper function to suggest appropriate role
const getSuggestedRole = (action) => {
  for (const [role, actions] of Object.entries(permissionHierarchy)) {
    if (actions.includes(action)) {
      return role;
    }
  }
  return null;
};

// Add support for checking multiple permissions
export const checkPermissions = (permissions, mode = 'ANY') => {
  return (req, res, next) => {
    try {
      if (req.user.roles.includes('super_admin')) {
        return next();
      }

      const hasPermissions = mode === 'ANY'
        ? permissions.some(p => req.user.permissions.includes(p))
        : permissions.every(p => req.user.permissions.includes(p));

      if (!hasPermissions) {
        return res.status(403).json({
          success: false,
          message: `You need ${mode === 'ANY' ? 'at least one of' : 'all'} the required permissions`,
          required: permissions,
          userPermissions: req.user.permissions
        });
      }

      next();
    } catch (error) {
      console.error('Multiple permissions check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Cleanup expired rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now - value.timestamp > RATE_WINDOW) {
      rateLimits.delete(key);
    }
  }
}, RATE_WINDOW);
