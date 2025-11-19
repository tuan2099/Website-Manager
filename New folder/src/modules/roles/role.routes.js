const express = require('express');
const controller = require('./role.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('role:list'), controller.listRoles);
router.post('/', requirePermission('role:create'), controller.createRole);
router.put('/:id', requirePermission('role:update'), controller.updateRole);
router.post('/:id/permissions', requirePermission('role:assignPermissions'), controller.assignPermissions);

module.exports = router;
