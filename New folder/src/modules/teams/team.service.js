const db = require('../../database/models');

async function createTeam(data) {
  return db.Team.create({ name: data.name, description: data.description });
}

async function listTeams() {
  return db.Team.findAll({ include: [{ model: db.User, as: 'members' }] });
}

async function addUserToTeam(teamId, userId, role = 'member') {
  const [membership] = await db.UserTeam.findOrCreate({
    where: { team_id: teamId, user_id: userId },
    defaults: { role },
  });

  if (membership.role !== role) {
    membership.role = role;
    await membership.save();
  }

  return membership;
}

async function removeUserFromTeam(teamId, userId) {
  const deleted = await db.UserTeam.destroy({ where: { team_id: teamId, user_id: userId } });
  return deleted > 0;
}

module.exports = {
  createTeam,
  listTeams,
  addUserToTeam,
  removeUserFromTeam,
};
