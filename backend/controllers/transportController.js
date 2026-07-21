const { Transport, School } = require('../models');

const getRoutes = async (req, res) => {
  try {
    const routes = await Transport.findAll();
    // We would need to manually resolve students.studentId if it is needed by frontend.
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addRoute = async (req, res) => {
  try {
    if (!req.body.routeName || !req.body.startPoint?.name || !req.body.endPoint?.name) {
      return res.status(400).json({ message: 'Missing required fields: routeName, startPoint, endPoint' });
    }

    let schoolId = req.body.school;
    if (!schoolId) {
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      schoolId = availableSchool.id;
    }

    const route = await Transport.create({
      ...req.body,
      schoolId,
      routeNumber: `RT-${Date.now()}`,
    });
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    if (req.body.routeName === '' || 
        (req.body.startPoint && req.body.startPoint.name === '') || 
        (req.body.endPoint && req.body.endPoint.name === '')) {
      return res.status(400).json({ message: 'Invalid field values: routeName, startPoint, endPoint cannot be empty' });
    }
    
    Object.assign(route, req.body);
    await route.save();
    res.json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignStudentToRoute = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const studentAssignment = {
      studentId: req.body.studentId,
      boarding: req.body.boarding,
      status: 'active',
    };

    const students = [...(route.students || [])];
    students.push(studentAssignment);
    route.students = students;

    await route.save();

    res.json({ 
      message: 'Student assigned to route',
      route,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeStudentFromRoute = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const students = (route.students || []).filter(
      s => String(s.studentId) !== String(req.body.studentId)
    );
    
    route.students = students;
    await route.save();
    res.json({ message: 'Student removed from route', route });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoutesBySchool = async (req, res) => {
  try {
    const routes = await Transport.findAll({ where: { schoolId: req.params.schoolId } });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicleLocation = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const tracking = { ...(route.gpsTracking || {}) };
    tracking.lastLocation = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timestamp: new Date(),
    };

    route.gpsTracking = tracking;
    await route.save();

    res.json({
      message: 'Vehicle location updated',
      location: route.gpsTracking.lastLocation,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getVehicleTracking = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({
      routeName: route.routeName,
      vehicle: route.vehicle,
      currentLocation: route.gpsTracking?.lastLocation,
      status: route.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await Transport.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    await route.destroy();
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  addRoute,
  updateRoute,
  assignStudentToRoute,
  removeStudentFromRoute,
  getRoutesBySchool,
  updateVehicleLocation,
  getVehicleTracking,
  deleteRoute,
};
