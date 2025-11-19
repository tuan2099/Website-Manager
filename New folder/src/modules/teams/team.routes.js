const express = require('express');
const controller = require('./team.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.post('/', requirePermission('team:create'), controller.createTeam);
router.get('/', requirePermission('team:list'), controller.listTeams);
router.post('/:id/users', requirePermission('team:manageMembers'), controller.addUser);
router.delete('/:id/users/:userId', requirePermission('team:manageMembers'), controller.removeUser);

module.exports = router;
