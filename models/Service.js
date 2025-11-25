// models/Service.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const pricingSchema = new mongoose.Schema({
  mostUrgent: { type: Number, default: 0 },
  urgent: { type: Number, default: 0 },
  lessUrgent: { type: Number, default: 0 },
  notUrgent: { type: Number, default: 0 }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. 'electrician'
  name: { type: String, required: true },             // e.g. 'Electrician'
  description: { type: String, default: '' },
  images: { type: [String], default: [] },            // urls (public/images/...)
  pricing: { type: pricingSchema, default: () => ({}) },
  feedbacks: { type: [feedbackSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
