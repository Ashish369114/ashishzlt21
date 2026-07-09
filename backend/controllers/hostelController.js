const Hostel = require('../models/Hostel');

const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find()
      .populate('rooms.students.studentId');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .populate('rooms.students.studentId');
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHostel = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.hostelName || !req.body.hostelType) {
      return res.status(400).json({ message: 'Missing required fields: hostelName, hostelType' });
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

    const hostel = new Hostel({
      ...req.body,
      school,
      availableBeds: req.body.totalBeds || 0,
    });
    const newHostel = await hostel.save();
    res.status(201).json(newHostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Validate required fields if being updated
    if (req.body.hostelName === '' || req.body.hostelType === '') {
      return res.status(400).json({ message: 'Invalid field values: hostelName and hostelType cannot be empty' });
    }
    
    Object.assign(hostel, req.body);
    const updatedHostel = await hostel.save();
    res.json(updatedHostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allocateStudentToRoom = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const room = hostel.rooms.find(r => r.roomNumber === req.body.roomNumber);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }

    const studentAssignment = {
      studentId: req.body.studentId,
      bedNumber: `BED-${room.roomNumber}-${room.occupiedBeds + 1}`,
      admissionDate: new Date(),
    };

    room.students.push(studentAssignment);
    room.occupiedBeds += 1;
    hostel.availableBeds -= 1;

    await hostel.save();
    res.json({
      message: 'Student allocated to room',
      studentAssignment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeStudentFromRoom = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const room = hostel.rooms.find(r => r.roomNumber === req.body.roomNumber);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.students = room.students.filter(
      s => s.studentId.toString() !== req.body.studentId
    );
    
    room.occupiedBeds -= 1;
    hostel.availableBeds += 1;

    await hostel.save();
    res.json({
      message: 'Student removed from room',
      room,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const hostels = await Hostel.find({ school: req.params.schoolId });
    const availableRooms = [];

    hostels.forEach(hostel => {
      hostel.rooms.forEach(room => {
        if (room.occupiedBeds < room.capacity) {
          availableRooms.push({
            hostelId: hostel._id,
            hostelName: hostel.hostelName,
            roomNumber: room.roomNumber,
            availableBeds: room.capacity - room.occupiedBeds,
            facilities: room.facilities,
          });
        }
      });
    });

    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerComplaint = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const complaint = {
      studentId: req.body.studentId,
      complaintType: req.body.complaintType,
      description: req.body.description,
      status: 'pending',
      submittedDate: new Date(),
    };

    hostel.complaints.push(complaint);
    await hostel.save();

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaint,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const complaint = hostel.complaints.id(req.params.complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'resolved';
    complaint.resolvedDate = new Date();

    await hostel.save();
    res.json({
      message: 'Complaint resolved',
      complaint,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getHostelBySchool = async (req, res) => {
  try {
    const hostels = await Hostel.find({ school: req.params.schoolId })
      .populate('rooms.students.studentId');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHostels,
  getHostelById,
  addHostel,
  updateHostel,
  allocateStudentToRoom,
  removeStudentFromRoom,
  getAvailableRooms,
  registerComplaint,
  resolveComplaint,
  getHostelBySchool,
  deleteHostel,
};
