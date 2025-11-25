// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
