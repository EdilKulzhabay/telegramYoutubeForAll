const mongoose = require('mongoose');

const subscriptionCancelAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  contractId: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  error: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  eventHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventHistory',
    required: true
  }
});

module.exports = mongoose.model('SubscriptionCancelAttempt', subscriptionCancelAttemptSchema); 