const { User } = require('../models');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { userId, password, role, firstName, lastName, email, phone, gender } = req.body;

    if (!userId || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ message: 'User ID, password, role, first name, and last name are required.' });
    }

    if (await User.findOne({ where: { userId } })) {
      return res.status(400).json({ message: 'User ID already exists.' });
    }

    if (email && await User.findOne({ where: { email } })) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const user = await User.create({ userId, password, role, firstName, lastName, email, phone, gender });
    const responseUser = user.toJSON();
    delete responseUser.password;
    res.status(201).json(responseUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, password, role, firstName, lastName, email, phone, gender, isActive } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userId && userId !== user.userId) {
      if (await User.findOne({ where: { userId } })) {
        return res.status(400).json({ message: 'User ID already exists.' });
      }
      user.userId = userId;
    }

    if (email && email !== user.email) {
      if (await User.findOne({ where: { email } })) {
        return res.status(400).json({ message: 'Email already exists.' });
      }
      user.email = email;
    }

    // Password updates are explicitly forbidden here; users must use forgot password
    if (role) user.role = role;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    const responseUser = user.toJSON();
    delete responseUser.password;
    res.json(responseUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
