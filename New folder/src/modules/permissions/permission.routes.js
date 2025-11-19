const express = require('express');
const controller = require('./permission.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('permission:list'), controller.listPermissions);
router.post('/', requirePermission('permission:create'), controller.createPermission);
router.put('/:id', requirePermission('permission:update'), controller.updatePermission);

module.exports = router;
