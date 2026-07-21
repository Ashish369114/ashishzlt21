const { Settings } = require('../models');

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSettings = async (req, res) => {
  try {
    const settings = await Settings.create({
      ...req.body,
      schoolId: req.body.schoolId || req.body.school,
    });
    res.status(201).json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGeneralSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.general = { ...(settings.general || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAcademicSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.academic = { ...(settings.academic || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmissionSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.admission = { ...(settings.admission || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFeeSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.fees = { ...(settings.fees || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.notification = { ...(settings.notification || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.security = { ...(settings.security || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBackupSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.backup = { ...(settings.backup || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCustomization = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.customization = { ...(settings.customization || {}), ...req.body };
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateIntegrations = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { schoolId: req.params.schoolId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    settings.integrations = { ...(settings.integrations || {}), ...req.body };
    await settings.save();
    res.json(settings);
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
