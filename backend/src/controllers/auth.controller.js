const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!authService.VALID_ROLES.includes(role)) {
      return res.status(422).json({ error: 'Invalid role' });
    }

    if (authService.findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = await authService.createUser({ name, email, password, role });
    return res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await authService.verifyPassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = authService.signToken(user);
    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
