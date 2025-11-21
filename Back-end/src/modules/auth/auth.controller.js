const authService = require('./auth.service');

async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register({ email, password, name });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    await authService.logout({ refreshToken });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await authService.refresh({ refreshToken });
    res.json({ accessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, { oldPassword, newPassword });
    res.json({ message: 'Password changed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  changePassword,
};
