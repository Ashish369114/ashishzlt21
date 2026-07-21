const { Hostel, School, Student, User } = require('../models');

const populateHostelRooms = async (hostels) => {
  const isArray = Array.isArray(hostels);
  const hstls = isArray ? hostels : [hostels];

  for (const h of hstls) {
    if (h.rooms && Array.isArray(h.rooms)) {
      for (const room of h.rooms) {
        if (room.students && Array.isArray(room.students)) {
          for (const s of room.students) {
            if (s.studentId) {
              const student = await Student.findByPk(s.studentId, { include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }) ||
                              await Student.findOne({ where: { userId: s.studentId }, include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] });
              s.studentId = student || s.studentId;
            }
          }
        }
      }
    }
  }

  return isArray ? hstls : hstls[0];
};

const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.findAll();
    await populateHostelRooms(hostels);
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findByPk(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    await populateHostelRooms(hostel);
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHostel = async (req, res) => {
  try {
    if (!req.body.hostelName || !req.body.hostelType) {
      return res.status(400).json({ message: 'Missing required fields: hostelName, hostelType' });
    }

    let schoolId = req.body.school;
    if (!schoolId) {
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      schoolId = availableSchool.id;
    }

    const payload = {
      ...req.body,
      schoolId,
      availableBeds: req.body.totalBeds || 0,
    };

    const newHostel = await Hostel.create(payload);
    res.status(201).json(newHostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByPk(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (req.body.hostelName === '' || req.body.hostelType === '') {
      return res.status(400).json({ message: 'Invalid field values: hostelName and hostelType cannot be empty' });
    }
    
    Object.assign(hostel, req.body);
    await hostel.save();
    res.json(hostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allocateStudentToRoom = async (req, res) => {
  try {
    const hostel = await Hostel.findByPk(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const rooms = [...(hostel.rooms || [])];
    const roomIndex = rooms.findIndex(r => String(r.roomNumber) === String(req.body.roomNumber));
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }

    let room = { ...rooms[roomIndex] };

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }

    const studentAssignment = {
      studentId: req.body.studentId,
      bedNumber: `BED-${room.roomNumber}-${(room.occupiedBeds || 0) + 1}`,
      admissionDate: new Date(),
    };

    room.students = room.students || [];
    room.students.push(studentAssignment);
    room.occupiedBeds = (room.occupiedBeds || 0) + 1;
    
    hostel.availableBeds = (hostel.availableBeds || 0) - 1;

    rooms[roomIndex] = room;
    hostel.rooms = rooms;
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
    const hostel = await Hostel.findByPk(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const rooms = [...(hostel.rooms || [])];
    const roomIndex = rooms.findIndex(r => String(r.roomNumber) === String(req.body.roomNumber));
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }

    let room = { ...rooms[roomIndex] };
    const initialCount = room.students ? room.students.length : 0;
    room.students = (room.students || []).filter(
      s => String(s.studentId) !== String(req.body.studentId) && String(s.studentId?.id) !== String(req.body.studentId)
    );
    
    const finalCount = room.students.length;
    
    if (initialCount > finalCount) {
      room.occupiedBeds = Math.max(0, (room.occupiedBeds || 0) - 1);
      hostel.availableBeds = (hostel.availableBeds || 0) + 1;
    }

    rooms[roomIndex] = room;
    hostel.rooms = rooms;
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
    const hostels = await Hostel.findAll({ where: { schoolId: req.params.schoolId } });
    const availableRooms = [];

    hostels.forEach(hostel => {
      (hostel.rooms || []).forEach(room => {
        if ((room.occupiedBeds || 0) < (room.capacity || 0)) {
          availableRooms.push({
            hostelId: hostel.id,
            hostelName: hostel.hostelName,
            roomNumber: room.roomNumber,
            availableBeds: room.capacity - (room.occupiedBeds || 0),
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
    const hostel = await Hostel.findByPk(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const complaint = {
      id: `COMP-${Date.now()}`,
      studentId: req.body.studentId,
      complaintType: req.body.complaintType,
      description: req.body.description,
      status: 'pending',
      submittedDate: new Date(),
    };

    const complaints = [...(hostel.complaints || []), complaint];
    hostel.complaints = complaints;
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
    const hostel = await Hostel.findByPk(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const complaints = [...(hostel.complaints || [])];
    const complaintIndex = complaints.findIndex(c => String(c.id) === String(req.params.complaintId) || String(c._id) === String(req.params.complaintId));
    
    if (complaintIndex === -1) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    let complaint = { ...complaints[complaintIndex] };
    complaint.status = 'resolved';
    complaint.resolvedDate = new Date();

    complaints[complaintIndex] = complaint;
    hostel.complaints = complaints;
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
    const hostels = await Hostel.findAll({ where: { schoolId: req.params.schoolId } });
    await populateHostelRooms(hostels);
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByPk(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    await hostel.destroy();
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
