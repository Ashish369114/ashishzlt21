const test = require('node:test');
const assert = require('assert');
const eventController = require('../controllers/eventController');
const Event = require('../models/Event');

test('addEvent populates organizer and attendees after saving', async () => {
  const originalEventSave = Event.prototype.save;
  const originalEventFindById = Event.findById;

  try {
    let savedEvent = null;
    Event.prototype.save = async function () {
      savedEvent = this;
      return this;
    };

    Event.findById = async () => ({
      _id: 'event-1',
      organizer: { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' },
      attendees: [{ _id: 'user-2', firstName: 'John', lastName: 'Smith' }],
      populate: async function (path) {
        if (path === 'organizer') {
          this.organizer = { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' };
        }
        if (path === 'attendees') {
          this.attendees = [{ _id: 'user-2', firstName: 'John', lastName: 'Smith' }];
        }
        return this;
      },
    });

    const req = {
      body: {
        title: 'Science Fair',
        description: 'Annual fair',
        eventDate: '2026-06-27',
        organizer: '507f191e810c19729de860ea',
        attendees: ['507f191e810c19729de860eb'],
      },
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await eventController.addEvent(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedEvent.title, 'Science Fair');
    assert.strictEqual(res.body.organizer._id, 'user-1');
    assert.strictEqual(res.body.attendees[0]._id, 'user-2');
  } finally {
    Event.prototype.save = originalEventSave;
    Event.findById = originalEventFindById;
  }
});

test('addEvent accepts organizer IDs with surrounding whitespace', async () => {
  const originalEventSave = Event.prototype.save;
  const originalEventFindById = Event.findById;

  try {
    let savedEvent = null;
    Event.prototype.save = async function () {
      savedEvent = this;
      return this;
    };

    Event.findById = async () => ({
      _id: 'event-2',
      organizer: { _id: '507f191e810c19729de860ea', firstName: 'Jane', lastName: 'Doe' },
      attendees: [],
      populate: async function () {
        return this;
      },
    });

    const req = {
      body: {
        title: 'Science Fair',
        description: 'Annual fair',
        eventDate: '2026-06-27',
        organizer: ' 507f191e810c19729de860ea ',
      },
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await eventController.addEvent(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedEvent.organizer, undefined);
  } finally {
    Event.prototype.save = originalEventSave;
    Event.findById = originalEventFindById;
  }
});

test('addEvent ignores organizer field from payload', async () => {
  const originalEventSave = Event.prototype.save;
  const originalEventFindById = Event.findById;

  try {
    let savedEvent = null;
    Event.prototype.save = async function () {
      savedEvent = this;
      return this;
    };

    Event.findById = async () => ({
      _id: 'event-3',
      organizer: null,
      attendees: [],
      populate: async function () {
        return this;
      },
    });

    const req = {
      body: {
        title: 'Science Fair',
        description: 'Annual fair',
        eventDate: '2026-06-27',
        organizer: '507f191e810c19729de860ea',
      },
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await eventController.addEvent(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedEvent.organizer, undefined);
  } finally {
    Event.prototype.save = originalEventSave;
    Event.findById = originalEventFindById;
  }
});
