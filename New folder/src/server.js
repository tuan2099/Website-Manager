const app = require('./app');
const { registerSslCheckJob } = require('./cron/sslCheckJob');
const { registerUptimeCheckJob } = require('./cron/uptimeCheckJob');
const { registerDomainExpiryCheckJob } = require('./cron/domainExpiryCheckJob');

const PORT = process.env.PORT || 3000;

registerSslCheckJob();
registerUptimeCheckJob();
registerDomainExpiryCheckJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
