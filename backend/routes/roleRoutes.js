import express from 'express';
import * as roleController from '../controllers/roleController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkPermission('roles', 'read'), roleController.getRoles);
router.post('/', checkPermission('roles', 'create'), roleController.createRole);
router.put('/:id', checkPermission('roles', 'update'), roleController.updateRole);
router.put('/:id/permissions', checkPermission('roles', 'update'), roleController.updateRolePermissions);

export default router;
