const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios')
const { menus } = require('./menus.js');
const { registerPayHandlers } = require('./handlers/pay.js');
const { registerPartnerHandlers } = require('./handlers/partner.js');
const { registerDonateHandlers } = require('./handlers/donate.js');
const { registerAboutHandlers } = require('./handlers/about.js');
const { registerCommonHandlers } = require('./handlers/common.js');
const User = require('./models/User.js');
const EventHistory = require('./models/EventHistory.js');

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
  await handleStart(ctx);
});

// Обработчик для слова "start"
bot.hears(/^start$/i, async (ctx) => {
  await handleStart(ctx);
});

async function handleStart(ctx) {
  const chatId = ctx.chat.id.toString();

  try {
      let user = await User.findOne({ chatId });

      if (!user) {
          user = new User({
              chatId,
              currentMenu: 'start',
              history: [],
          });
          await user.save();
      } else {
          user.currentMenu = 'start';
          user.history = [];
          await user.save();
      }

      await ctx.sendVideo(
        "BAACAgIAAxkDAAIBoGfQg7RyamGcAjjFU2xzsLaXygclAAKYcgACnHKISkGiUwABzfmF_TYE",
        { caption: "Добро пожаловать! 🎬 Подробности ниже ⬇️" }
      );
      await ctx.reply(menus.start.text, menus.start);

  } catch (error) {
      console.error("Ошибка в /start:", error);
      await ctx.reply("Произошла ошибка, попробуйте снова.");
  }
}

////testgit

bot.hears('Подробнее', async (ctx) => {
  try {
      const chatId = ctx.chat.id.toString();
      let user = await User.findOne({ chatId });

      if (!user) {
          user = new User({
              chatId,
              currentMenu: 'start',
              history: [],
          });
          await user.save();
      } else {
          user.currentMenu = 'start';
          user.history = [];
          await user.save();
      }

      await ctx.sendVideo(
        "BAACAgIAAxkDAAIBoGfQg7RyamGcAjjFU2xzsLaXygclAAKYcgACnHKISkGiUwABzfmF_TYE",
        { caption: "Добро пожаловать! 🎬 Подробности ниже ⬇️" }
      );
      await ctx.reply(menus.start.text, menus.start);
  } catch (error) {
      console.error('Ошибка в обработчике "Подробнее":', error);
      await ctx.reply('Произошла ошибка, попробуйте снова.');
  }
});

bot.on("chat_join_request", async (ctx) => {
    try {
        const user = ctx.chatJoinRequest.from;
        const chatId = user.id;

        console.log(`Запрос на вступление: ${user.first_name} (@${user.username})`);

        // Ищем пользователя в базе данных
        let dbUser = await User.findOne({ chatId });

        if (!dbUser) {
          dbUser = new User({chatId, channelAccess: false})  
          await dbUser.save()
        }

        if (dbUser.channelAccess) {
            // Если у пользователя есть доступ — одобряем заявку
            await ctx.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, chatId);
            console.log(`✅ Доступ выдан: ${user.first_name} (@${user.username})`);
        } else {
            // Если доступа нет — отправляем уведомление
            const isBanned = await isUserBanned("-1002404499058_1", chatId)

            if (isBanned) {
              await unbanUser("-1002404499058_1", chatId)
            }
            await ctx.telegram.declineChatJoinRequest("-1002404499058_1", chatId);
            await ctx.telegram.sendMessage(
              chatId,
              `Для доступа к Образовательному сообществу "YouTube для ВСЕХ" вам необходимо оформить подписку.`,
              {
                  reply_markup: {
                      keyboard: [
                          [{ text: "Подробнее" }]
                      ],
                      resize_keyboard: true,
                      one_time_keyboard: true
                  }
              }
          );
            console.log(`⛔ Доступ отклонен: ${user.first_name} (@${user.username})`);
        }
    } catch (error) {
        console.error("❌ Ошибка в обработке запроса на вступление:", error);
    }
});



async function isUserBanned(chatId, userId) {
  try {
      const member = await bot.telegram.getChatMember(chatId, userId);
      return member.status === 'kicked'; // true, если в бане
  } catch (error) {
      console.error("Ошибка при проверке статуса пользователя:", error);
      return false;
  }
}


async function unbanUser(chatId, userId) {
  try {
      await bot.telegram.unbanChatMember(chatId, userId);
      console.log(`✅ Пользователь ${userId} разбанен в группе ${chatId}`);
  } catch (error) {
      console.error("Ошибка при разбане пользователя:", error);
  }
}

registerPayHandlers(bot, menus);
registerPartnerHandlers(bot, userStates, menus);
registerDonateHandlers(bot, userStates, menus);
registerAboutHandlers(bot, userStates, menus);
registerCommonHandlers(bot, menus);

bot.launch().then(() => {
  console.log('Бот запущен!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", // Можно указать конкретный домен, например, "https://kulzhabay.kz"
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With",
  credentials: true
}));

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

app.post('/lavaTopNormalPay', async (req, res) => {
  try {
    try {
      const {status, buyer, timestamp} = req.body
      console.log("req.body in lavaTopNormalPay = ", req.body);
      await EventHistory.create({
        eventType: req.body.eventType,
        timestamp: new Date(req.body.timestamp || Date.now()), // Используем timestamp, если есть
        rawData: req.body // Полностью сохраняем весь req.body
      });
      if (status === "subscription-active") {
        const userEmail = buyer.email
        
        const user = await User.findOne({ email: userEmail });
  
        if (!user) {
          return res.status(404).json({ error: "Пользователь не найден" });
        }

        const chatId = user.chatId

        const isBanned = await isUserBanned("-1002404499058_1", chatId)

        if (isBanned) {
          await unbanUser("-1002404499058_1", chatId)
        }
  
        // Обновить пользователя в базе данных
        user.channelAccess = true;
        user.payData.date = new Date(timestamp); // Преобразуем в объект Date
  
        await user.save();
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: `Нажмите, чтобы присоединиться: https://t.me/+OKyL_x3DpoY5YmNi`
      });
  
        return res.json({ message: "Оплата подтверждена, доступ выдан" });
      }


      res.json({ message: "Статус не 'completed', обновление не требуется" });
    } catch (error) {
      console.error('Ошибка в lavaTest:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/lavaTopRegularPay', async (req, res) => {
  try {
    const {status, buyer, timestamp} = req.body
    console.log("req.body in lavaTopRegularPay = ", req.body);
    await EventHistory.create({
      eventType: req.body.eventType,
      timestamp: new Date(req.body.timestamp || Date.now()), // Используем timestamp, если есть
      rawData: req.body // Полностью сохраняем весь req.body
    });
    
    if (status === "subscription-active") {
      const userEmail = buyer.email
      
      const user = await User.findOne({ email: userEmail });

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const chatId = user.chatId

      const isBanned = await isUserBanned("-1002404499058_1", chatId)

      if (isBanned) {
        await unbanUser("-1002404499058_1", chatId)
      }

      // Обновить пользователя в базе данных
      user.channelAccess = true;
      user.payData.date = new Date(timestamp); // Преобразуем в объект Date

      await user.save();
      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `Нажмите, чтобы присоединиться: https://t.me/+OKyL_x3DpoY5YmNi`
      });

      return res.json({ message: "Оплата подтверждена, доступ выдан" });
    }
    res.json({ message: "Статус не 'completed', обновление не требуется" });
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post("/create-invoice", async (req, res) => {
  try {
      const { email, periodicity, currency } = req.body;

      let paymentMethod = ""

      if (currency === "USD") {
        paymentMethod = "UNLIMINT"
      } else {
        paymentMethod = "BANK131"
      }

      const data = {
        email,
        offerId: process.env.OFFER_ID,
        periodicity,
        currency,
        paymentMethod
      }

      console.log("data in create-invoice = ", data);

      const response = await axios.post("https://gate.lava.top/api/v2/invoice", {...data}, {
          headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.X_API_KEY,
          },
      });

      console.log("response in create-invoice = ", response.data);

      // const invoiceId = response.data.id;
      // startInvoiceStatusCheck(invoiceId);

      res.json(response.data);
  } catch (error) {
      console.error("Ошибка при создании счета:", error?.response?.data || error.message);
      res.status(500).json({ error: "Ошибка при создании счета" });
  }
});

app.get("/getProducts", async (req, res) => {
  try {
      const response = await axios.get("https://gate.lava.top/api/v2/products", {
          headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.X_API_KEY,
          },
          params: {
            showAllSubscriptionPeriods: true
          }
      });


      res.json(response.data);
  } catch (error) {
      console.error("Ошибка при создании счета:", error?.response?.data || error.message);
      res.status(500).json({ error: "Ошибка при создании счета" });
  }
});

app.post("/unban", async (req, res) => {
  try {
      await unbanUser("-1002404499058_1", "1308683371")
      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: "1308683371",
        text: `Нажмите, чтобы присоединиться: https://t.me/+OKyL_x3DpoY5YmNi`
      });
      res.json({success: "unban!!!!"});
  } catch (error) {
      console.error("Ошибка при unban");
      res.status(500).json({ error: "Ошибка при создании счета" });
  }
});

app.post("/updateUser", async (req, res) => {
  try {
    console.log("we in updateUser req.body = ", req.body);
    
    const {chatId, email} = req.body

    const user = await User.findOne({chatId})

    console.log("user = ", user);

    user.email = email

    await user.save()

    res.json({message: "success"})
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
})

app.post("/updateUserInvoiceId", async (req, res) => {
  try {
    console.log("we in updateUserInvoiceId req.body = ", req.body);
    const {chatId, invoiceId} = req.body

    const user = await User.findOne({chatId})

    user.invoiceId = invoiceId

    await user.save()
    res.json({message: "success"})
  } catch (error) {
    console.error('Ошибка в lavaTest:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
})

const PORT = process.env.PORT || 3006;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});