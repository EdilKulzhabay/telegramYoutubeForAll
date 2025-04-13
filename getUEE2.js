const EventHistory = require('./models/EventHistory.js');

async function getUniqueEmailEvents() {
  try {
    const uniqueEvents = await EventHistory.aggregate([
      {
        $match: {
          eventType: "payment.success"
        }
      },
      {
        $group: {
          _id: "$rawData.buyer.email",
          latestEvent: { $last: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestEvent" }
      }
    ]);
    
    console.log('Уникальные события:', uniqueEvents);
    return uniqueEvents;
  } catch (err) {
    console.error('Ошибка при получении событий:', err);
    throw err;
  }
}