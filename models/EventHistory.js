const mongoose = require('mongoose');

const eventHistorySchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // Тип события
  timestamp: { type: Date, default: Date.now }, // Время события
  rawData: { type: Object, required: true } // Полностью сохраняем весь req.body
});

const EventHistory = mongoose.model('EventHistory', eventHistorySchema);

module.exports = EventHistory;
