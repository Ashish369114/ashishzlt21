const Transport = require('../models/Transport');

const getRoutes = async (req, res) => {
  try {
    const routes = await Transport.find()
      .populate('students.studentId');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id)
      .populate('students.studentId');
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
    // Validate required fields
    if (!req.body.routeName || !req.body.startPoint?.name || !req.body.endPoint?.name) {
      return res.status(400).json({ message: 'Missing required fields: routeName, startPoint, endPoint' });
    }

    // Get first available school if not provided
    let school = req.body.school;
    if (!school) {
      const School = require('../models/School');
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      school = availableSchool._id;
    }

    const route = new Transport({
      ...req.body,
      school,
      routeNumber: `RT-${Date.now()}`,
    });
    const newRoute = await route.save();
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // Validate required fields if being updated
    if (req.body.routeName === '' || 
        (req.body.startPoint && req.body.startPoint.name === '') || 
        (req.body.endPoint && req.body.endPoint.name === '')) {
      return res.status(400).json({ message: 'Invalid field values: routeName, startPoint, endPoint cannot be empty' });
    }
    
    Object.assign(route, req.body);
    const updatedRoute = await route.save();
    res.json(updatedRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignStudentToRoute = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const studentAssignment = {
      studentId: req.body.studentId,
      boarding: req.body.boarding,
      status: 'active',
    };

    route.students.push(studentAssignment);
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
    const route = await Transport.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    route.students = route.students.filter(
      s => s.studentId.toString() !== req.body.studentId
    );
    
    await route.save();
    res.json({ message: 'Student removed from route', route });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoutesBySchool = async (req, res) => {
  try {
    const routes = await Transport.find({ school: req.params.schoolId })
      .populate('students.studentId');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicleLocation = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    if (!route.gpsTracking) {
      route.gpsTracking = {};
    }

    route.gpsTracking.lastLocation = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timestamp: new Date(),
    };

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
    const route = await Transport.findById(req.params.id);
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
    const route = await Transport.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
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
