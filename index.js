const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const { menus } = require('./menus.js');
const { registerPayHandlers } = require('./handlers/pay.js');
const { registerPartnerHandlers } = require('./handlers/partner.js');
const { registerDonateHandlers } = require('./handlers/donate.js');
const { registerAboutHandlers } = require('./handlers/about.js');
const { registerCommonHandlers } = require('./handlers/common.js');
const User = require('./models/User.js');

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
const BOT_USERNAME = process.env.BOT_USERNAME;

const userStates = new Map();

const generateReferralLink = (chatId) => {
  return `https://t.me/${BOT_USERNAME}?start=ref_${chatId}`;
};

bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const args = ctx.startPayload;

  try {
    let user = await User.findOne({ chatId });

    if (!user) {
      user = new User({
        chatId,
        refferal: generateReferralLink(chatId),
      });
      await user.save();
    }

    if (args && args.startsWith('ref_')) {
      const referrerChatId = args.split('ref_')[1];
      if (referrerChatId !== chatId) {
        const referrer = await User.findOne({ chatId: referrerChatId });
        if (referrer) {
          referrer.refferalBonus += 1;
          await referrer.save();
          await ctx.reply(`Вы зашли по реферальной ссылке! Пригласившему начислен бонус.`);
        }
      }
    }

    userStates.set(chatId, {
      currentMenu: 'start',
      history: [],
    });

    await ctx.reply(menus.start.text, menus.start);
  } catch (error) {
    console.error('Error in /start:', error);
    await ctx.reply('Произошла ошибка, попробуйте снова.');
  }
});

bot.on('chat_join_request', async (ctx) => {
  const user = ctx.chatJoinRequest.from;
  console.log(ctx);

  console.log(user);
  
  
  
  console.log(`Запрос на вступление: ${user.first_name} (@${user.username})`);

  await ctx.telegram.sendMessage(
      user.id,
      `Привет, ${user.first_name}! Ваша заявка на вступление в канал рассматривается.`
  );
});

registerPayHandlers(bot, userStates, menus);
registerPartnerHandlers(bot, userStates, menus);
registerDonateHandlers(bot, userStates, menus);
registerAboutHandlers(bot, userStates, menus);
registerCommonHandlers(bot, userStates, menus);

bot.launch().then(() => {
  console.log('Бот запущен!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const app = express();
app.use(express.json());
app.use(bot.webhookCallback('/bot'));

const API_KEY = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
  console.log("req.headers = ", req.headers);
  const providedApiKey = req.headers['x-api-key'];

  if (!providedApiKey || providedApiKey !== API_KEY) {
    return res.status(401).json({ error: 'Недействительный или отсутствующий API-ключ' });
  }
  next();
};

app.post('/updateUser', async (req, res) => {
  try {
    const {chatId, email} = req.body
    const user = await User.findOne({chatId})

    if (!user) {
      const newUser = new User({
        chatId,
        email
      })

      await newUser.save()
    }

    user.email = email

    await user.save()

    res.json({success: true})
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
})

app.post('/lavaTopNormalPay', async (req, res) => {
  try {
    console.log("req.headers = ", req.headers);
    console.log("req.body = ", req.body);
    const body = req.body
    res.json({body})
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/lavaTopRegularPay', async (req, res) => {
  try {
    console.log("req.headers = ", req.headers);
    console.log("req.body = ", req.body);
    const body = req.body
    res.json({body})
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});