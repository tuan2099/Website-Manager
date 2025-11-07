import express from 'express';
import * as permissionController from '../controllers/permissionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkPermission('permissions', 'read'), permissionController.getPermissions);
router.get('/by-resource', checkPermission('permissions', 'read'), permissionController.getPermissionsByResource);

export default router;
