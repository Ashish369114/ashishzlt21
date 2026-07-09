const mongoose = require('mongoose');
const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer')
      .populate('attendees');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer')
      .populate('attendees');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sanitizeEventBody = (body) => {
  const payload = { ...body };
  delete payload.organizer;

  if (payload.attendees && Array.isArray(payload.attendees)) {
    payload.attendees = payload.attendees.filter((attendee) => attendee && attendee.toString().trim() !== '');
    payload.attendees = payload.attendees.filter((attendee) => mongoose.Types.ObjectId.isValid(attendee));
  }

  return payload;
};

const addEvent = async (req, res) => {
  try {
    const payload = sanitizeEventBody(req.body);
    const event = new Event(payload);
    await event.save();

    const populatedEvent = await Event.findById(event._id);
    await populatedEvent.populate('organizer');
    await populatedEvent.populate('attendees');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const payload = sanitizeEventBody(req.body);
    const event = await Event.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('organizer')
      .populate('attendees');
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
};
