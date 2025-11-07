import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createUserValidator, updateUserValidator } from '../utils/validators.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkPermission('users', 'read'), userController.getUsers);
router.post('/', checkPermission('users', 'create'), validate(createUserValidator), userController.createUser);
router.get('/:id', checkPermission('users', 'read'), userController.getUser);
router.put('/:id', checkPermission('users', 'update'), validate(updateUserValidator), userController.updateUser);
router.delete('/:id', checkPermission('users', 'delete'), userController.deleteUser);

export default router;
