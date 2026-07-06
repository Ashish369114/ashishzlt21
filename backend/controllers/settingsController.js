const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSettings = async (req, res) => {
  const settings = new Settings({
    ...req.body,
    school: req.body.schoolId,
  });
  try {
    const newSettings = await settings.save();
    res.status(201).json(newSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    Object.assign(settings, req.body);
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGeneralSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.general = { ...settings.general, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAcademicSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.academic = { ...settings.academic, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmissionSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.admission = { ...settings.admission, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFeeSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.fees = { ...settings.fees, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.notification = { ...settings.notification, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.security = { ...settings.security, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBackupSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.backup = { ...settings.backup, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCustomization = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.customization = { ...settings.customization, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateIntegrations = async (req, res) => {
  try {
    const settings = await Settings.findOne({ school: req.params.schoolId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.integrations = { ...settings.integrations, ...req.body };
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  updateGeneralSettings,
  updateAcademicSettings,
  updateAdmissionSettings,
  updateFeeSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateBackupSettings,
  updateCustomization,
  updateIntegrations,
};
