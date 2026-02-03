const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const TripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currency: { type: String, required: true },
  budget: { type: Number, required: true },
  people: [PersonSchema],
  expenses: [{
    payer: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);
