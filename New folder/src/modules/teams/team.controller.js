const teamService = require('./team.service');

async function createTeam(req, res) {
  try {
    const team = await teamService.createTeam({
      name: req.body.name,
      description: req.body.description,
    });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listTeams(req, res) {
  const teams = await teamService.listTeams();
  res.json(teams);
}

async function addUser(req, res) {
  try {
    const membership = await teamService.addUserToTeam(
      req.params.id,
      req.body.user_id,
      req.body.role
    );
    if (!membership) return res.status(404).json({ message: 'Team or user not found' });
    res.status(201).json(membership);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function removeUser(req, res) {
  const ok = await teamService.removeUserFromTeam(req.params.id, req.params.userId);
  if (!ok) return res.status(404).json({ message: 'Membership not found' });
  res.json({ message: 'Removed from team' });
}

module.exports = {
  createTeam,
  listTeams,
  addUser,
  removeUser,
};
