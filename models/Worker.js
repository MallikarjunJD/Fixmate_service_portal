// models/Worker.js
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, index: true },
  password: { type: String }, // hashed password later (bcrypt)
  primarySkill: { type: String, required: true }, // e.g. 'Electrician'
  secondarySkills: { type: [String], default: [] },
  area: { type: String }, // service area
  status: { type: String, enum: ['Available','Busy','Offline'], default: 'Available' },
  currentRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
