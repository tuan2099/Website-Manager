require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const roleRoutes = require('./modules/roles/role.routes');
const permissionRoutes = require('./modules/permissions/permission.routes');
const activityLogRoutes = require('./modules/activityLogs/activityLog.routes');
const websiteRoutes = require('./modules/websites/website.routes');
const teamRoutes = require('./modules/teams/team.routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);
app.use('/activity-logs', activityLogRoutes);
app.use('/websites', websiteRoutes);
app.use('/teams', teamRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
