const express = require('express');
const controller = require('./user.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('user:list'), controller.listUsers);
router.get('/:id', requirePermission('user:view'), controller.getUser);
router.put('/:id', requirePermission('user:update'), controller.updateUser);
router.post('/:id/roles', requirePermission('user:assignRoles'), controller.assignRoles);

module.exports = router;
