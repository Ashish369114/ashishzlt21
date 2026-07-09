const test = require('node:test');
const assert = require('assert');
const express = require('express');
const request = require('supertest');
const Module = require('module');
const path = require('path');

const authPath = require.resolve('../middleware/auth');
const rolePath = require.resolve('../middleware/roleMiddleware');
const marksModelPath = require.resolve('../models/Marks');

const originalAuthCache = require.cache[authPath];
const originalRoleCache = require.cache[rolePath];
const originalMarksCache = require.cache[marksModelPath];

require.cache[authPath] = {
  id: authPath,
  filename: authPath,
  loaded: true,
  exports: (req, res, next) => {
    req.user = { id: '507f191e810c19729de860ea' };
    next();
  },
  children: [],
  paths: Module._nodeModulePaths(path.dirname(authPath)),
};

require.cache[rolePath] = {
  id: rolePath,
  filename: rolePath,
  loaded: true,
  exports: () => (req, res, next) => next(),
  children: [],
  paths: Module._nodeModulePaths(path.dirname(rolePath)),
};

require.cache[marksModelPath] = {
  id: marksModelPath,
  filename: marksModelPath,
  loaded: true,
  exports: {
    findByIdAndUpdate: () => {
      const query = {
        _id: '507f191e810c19729de860ed',
        populate: function () {
          return this;
        },
      };
      return query;
    },
  },
  children: [],
  paths: Module._nodeModulePaths(path.dirname(marksModelPath)),
};

const marksRoutes = require('../routes/marks');

test.after(() => {
  if (originalAuthCache) {
    require.cache[authPath] = originalAuthCache;
  } else {
    delete require.cache[authPath];
  }

  if (originalRoleCache) {
    require.cache[rolePath] = originalRoleCache;
  } else {
    delete require.cache[rolePath];
  }

  if (originalMarksCache) {
    require.cache[marksModelPath] = originalMarksCache;
  } else {
    delete require.cache[marksModelPath];
  }
});

test('POST /api/marks rejects blank class field in add marks payload', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/marks', marksRoutes);

  const response = await request(app)
    .post('/api/marks')
    .send({
      student: '507f191e810c19729de860eb',
      teacher: '507f191e810c19729de860ea',
      subject: '507f191e810c19729de860ec',
      class: '',
      marks: 90,
      examType: 'Final',
    });

  assert.strictEqual(response.status, 400);
  assert.match(response.body.message, /Missing required fields: class/);
});

test('PUT /api/marks allows partial updates without requiring all fields', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/marks', marksRoutes);

  const response = await request(app)
    .put('/api/marks/507f191e810c19729de860ed')
    .send({
      marks: 95,
    });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body._id, '507f191e810c19729de860ed');
});
