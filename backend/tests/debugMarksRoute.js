const express = require('express');
const request = require('supertest');
const Module = require('module');
const path = require('path');

const authPath = require.resolve('../middleware/auth');
const rolePath = require.resolve('../middleware/roleMiddleware');
const marksModelPath = require.resolve('../models/Marks');

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
    findByIdAndUpdate: () => ({
      populate: async () => ({ _id: '507f191e810c19729de860ed' }),
    }),
  },
  children: [],
  paths: Module._nodeModulePaths(path.dirname(marksModelPath)),
};

const marksRoutes = require('../routes/marks');
const app = express();
app.use(express.json());
app.use('/api/marks', marksRoutes);

(async () => {
  const response = await request(app)
    .put('/api/marks/507f191e810c19729de860ed')
    .send({ marks: 95 });

  console.log('status', response.status);
  console.log('body', response.body);
})();