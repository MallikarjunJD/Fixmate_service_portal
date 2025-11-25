// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },   // maps to Service.id
  serviceName: { type: String, required: true },

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },

  location: { type: String, required: true },
  distance: { type: String, default:"5km" }, // store computed distance text or meters

  priority: { type: String, enum: ['Most Urgent','Urgent','Less Urgent','Not Urgent'], default: 'Not Urgent' },
  paymentMethod: { type: String, enum: ['Online','Cash','Wallet','Other'], default: 'Cash' },

  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  slaDeadline: { type: Date, required: false }, // compute based on priority
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null }, // worker who accepted
  status: { type: String, enum: ['Pending','Accepted','InProgress','Completed','Cancelled','SLA Breached'], default: 'Pending' },

  meta: {
    notes: { type: String , default: '' },
    attachments: { type: [String], default: [] } // file urls if any
  }
}, { timestamps: true });

/*
 * Virtual or helper: you can compute SLA / time-left by using createdAt + priority windows
 * in your controller or front-end.
 */

module.exports = mongoose.model('Request', requestSchema);
