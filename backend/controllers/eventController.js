const { Event, User } = require('../models');

const populateEventArrays = async (events) => {
  const isArray = Array.isArray(events);
  const eventList = isArray ? events : [events];

  for (const e of eventList) {
    if (e.attendees && e.attendees.length > 0) {
      e.dataValues.attendeesList = await User.findAll({ 
        where: { id: e.attendees },
        attributes: { exclude: ['password'] }
      });
    } else {
      e.dataValues.attendeesList = [];
    }
    
    e.dataValues.attendees = e.dataValues.attendeesList;
  }

  return isArray ? eventList : eventList[0];
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { model: User, as: 'organizer', attributes: { exclude: ['password'] } }
      ]
    });
    
    await populateEventArrays(events);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: { exclude: ['password'] } }
      ]
    });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await populateEventArrays(event);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sanitizeEventBody = (body) => {
  const payload = { ...body };
  
  if (payload.organizer) {
    payload.organizerId = payload.organizer;
    delete payload.organizer;
  }

  if (payload.attendees && Array.isArray(payload.attendees)) {
    payload.attendees = payload.attendees
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);
  }

  return payload;
};

const addEvent = async (req, res) => {
  try {
    const payload = sanitizeEventBody(req.body);
    const event = await Event.create(payload);

    const populatedEvent = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'organizer', attributes: { exclude: ['password'] } }
      ]
    });
    await populateEventArrays(populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const payload = sanitizeEventBody(req.body);
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    Object.assign(event, payload);
    await event.save();
    
    const populatedEvent = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'organizer', attributes: { exclude: ['password'] } }
      ]
    });
    await populateEventArrays(populatedEvent);

    res.json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.destroy();
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
