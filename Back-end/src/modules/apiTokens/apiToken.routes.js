const express = require('express');
const controller = require('./apiToken.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('apiToken:manage'), controller.listTokens);
router.post('/', requirePermission('apiToken:manage'), controller.createToken);
router.delete('/:id', requirePermission('apiToken:manage'), controller.revokeToken);

module.exports = router;
