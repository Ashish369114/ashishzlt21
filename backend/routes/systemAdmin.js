const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditLogger = require('../middleware/auditLogger');
const { sequelize } = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/system-admin/status (Get DB & system status)
router.get('/status', auth, roleMiddleware(['super_admin']), async (req, res) => {
  try {
    const dbDialect = sequelize.getDialect();
    const isConnected = true;
    const uptimeSeconds = process.uptime();

    res.json({
      success: true,
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        dbDialect,
        isConnected,
        uptimeSeconds: Math.floor(uptimeSeconds),
        serverTime: new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/system-admin/backup (Trigger Database Backup)
router.get('/backup', auth, roleMiddleware(['super_admin']), auditLogger('EXPORT', 'Database Backup'), async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `school_os_backup_${timestamp}.json`;
    
    // Collect JSON dump of core tables
    const models = sequelize.models;
    const backupData = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.userId,
        version: '1.0.0',
      },
      tables: {}
    };

    for (const [modelName, model] of Object.entries(models)) {
      try {
        const rows = await model.findAll({ raw: true });
        backupData.tables[modelName] = rows;
      } catch (err) {
        console.warn(`Backup table ${modelName} warning:`, err.message);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate database backup' });
  }
});

// POST /api/system-admin/restore (Restore Database from Backup JSON)
router.post('/restore', auth, roleMiddleware(['super_admin']), auditLogger('RESTORE', 'Database Restore'), async (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || !backupData.tables) {
      return res.status(400).json({ success: false, message: 'Invalid backup file payload' });
    }

    let restoredCount = 0;
    const models = sequelize.models;

    for (const [modelName, rows] of Object.entries(backupData.tables)) {
      if (models[modelName] && Array.isArray(rows) && rows.length > 0) {
        try {
          await models[modelName].bulkCreate(rows, { ignoreDuplicates: true });
          restoredCount += rows.length;
        } catch (err) {
          console.warn(`Restore error for ${modelName}:`, err.message);
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully processed restore. Imported ${restoredCount} total records.`,
      restoredCount
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore database from backup' });
  }
});

module.exports = router;
