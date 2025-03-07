import { Telegraf } from 'telegraf';
import mongoose from 'mongoose';
import express from 'express'
import dotenv from 'dotenv';
import { menus } from './menus.js';
import { registerPayHandlers } from './handlers/pay.js';
import { registerPartnerHandlers } from './handlers/partner.js';
import { registerDonateHandlers } from './handlers/donate.js';
import { registerAboutHandlers } from './handlers/about.js';
import { registerCommonHandlers } from './handlers/common.js';
import User from './models/User.js'; // Импортируем модель пользователя

dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/telegram")
  .then(() => {
    console.log("Mongodb OK");
  })
  .catch((err) => {
    console.log("Mongodb Error", err);
  });

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_USERNAME = process.env.BOT_USERNAME

const userStates = new Map();

// Функция для генерации реферальной ссылки
const generateReferralLink = (chatId) => {
  return `https://t.me/${BOT_USERNAME}?start=ref_${chatId}`;
};

// Обработчик команды /start
bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString(); // Приводим chatId к строке
  const args = ctx.startPayload; // Получаем параметр после /start (например, ref_123)

  try {
    // Проверяем, есть ли пользователь в базе
    let user = await User.findOne({ chatId });

    // Если пользователя нет, создаем нового
    if (!user) {
      user = new User({
        chatId,
        refferal: generateReferralLink(chatId), // Генерируем реферальную ссылку
      });
      await user.save();
    }

    // Проверяем, пришел ли пользователь по реферальной ссылке
    if (args && args.startsWith('ref_')) {
      const referrerChatId = args.split('ref_')[1]; // Извлекаем chatId пригласившего
      if (referrerChatId !== chatId) { // Проверяем, что это не сам пользователь
        const referrer = await User.findOne({ chatId: referrerChatId });
        if (referrer) {
          // Увеличиваем бонус пригласившему
          referrer.refferalBonus += 1; // Можно настроить значение бонуса
          await referrer.save();
          await ctx.reply(`Вы зашли по реферальной ссылке! Пригласившему начислен бонус.`);
        }
      }
    }

    // Устанавливаем состояние пользователя
    userStates.set(chatId, {
      currentMenu: 'start',
      history: [],
    });

    // Отправляем стартовое меню
    await ctx.reply(menus.start.text, menus.start);
  } catch (error) {
    console.error('Error in /start:', error);
    await ctx.reply('Произошла ошибка, попробуйте снова.');
  }
});

// Регистрация обработчиков
registerPayHandlers(bot, userStates, menus);
registerPartnerHandlers(bot, userStates, menus);
registerDonateHandlers(bot, userStates, menus);
registerAboutHandlers(bot, userStates, menus);
registerCommonHandlers(bot, userStates, menus);

bot.launch().then(() => {
  console.log('Бот запущен!');
});

// Обработка остановки бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const app = express();
app.use(express.json()); // Для обработки JSON-запросов
app.use(bot.webhookCallback('/bot')); // Webhook для Telegram

const API_KEY = process.env.API_KEY

// Middleware для проверки API-ключа
const checkApiKey = (req, res, next) => {
  console.log("req.headers = ", req.headers);
  const providedApiKey = req.headers['x-api-key']; // Ожидаем API-ключ в заголовке
  
  
  if (!providedApiKey || providedApiKey !== API_KEY) {
    return res.status(401).json({ error: 'Недействительный или отсутствующий API-ключ' });
  }
  next();
};

// Пример API-эндпоинта для обработки запросов от стороннего сервиса
app.post('/lavaTest', checkApiKey, async (req, res) => {
  try {
    console.log("req.body = ", req.body);
    
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});