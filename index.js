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

bot.on("chat_join_request", async (ctx) => {
    try {
        const user = ctx.chatJoinRequest.from;
        const chatId = user.id;

        console.log(`Запрос на вступление: ${user.first_name} (@${user.username})`);

        // Ищем пользователя в базе данных
        const dbUser = await User.findOne({ chatId });

        if (!dbUser) {
            console.log(`❌ Пользователь ${chatId} не найден в базе.`);
            return;
        }

        if (dbUser.channelAccess) {
            // Если у пользователя есть доступ — одобряем заявку
            await ctx.telegram.approveChatJoinRequest(ctx.chatJoinRequest.chat.id, chatId);
            console.log(`✅ Доступ выдан: ${user.first_name} (@${user.username})`);
        } else {
            // Если доступа нет — отправляем уведомление
            await ctx.telegram.sendMessage(
                chatId,
                `❌ Ваша заявка на вступление в канал отклонена. Оплатите подписку, чтобы получить доступ.`
            );
            console.log(`⛔ Доступ отклонен: ${user.first_name} (@${user.username})`);
        }
    } catch (error) {
        console.error("❌ Ошибка в обработке запроса на вступление:", error);
    }
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
app.use(cors());

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
      if (status === "completed") {
        const userEmail = buyer.email
        
        const user = await User.findOne({ email: userEmail });
  
        if (!user) {
          return res.status(404).json({ error: "Пользователь не найден" });
        }
  
        // Обновить пользователя в базе данных
        user.channelAccess = true;
        user.payData.date = new Date(timestamp); // Преобразуем в объект Date
  
        await user.save();
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: `Нажмите, чтобы присоединиться: https://t.me/+IeH_W-Dbbyg3ZTJi`
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
    if (status === "completed") {
      const userEmail = buyer.email
      
      const user = await User.findOne({ email: userEmail });

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Обновить пользователя в базе данных
      user.channelAccess = true;
      user.payData.date = new Date(timestamp); // Преобразуем в объект Date

      await user.save();
      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `Нажмите, чтобы присоединиться: https://t.me/+IeH_W-Dbbyg3ZTJi`
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

      res.json(response.data);
  } catch (error) {
      console.error("Ошибка при создании счета:", error?.response?.data || error.message);
      res.status(500).json({ error: "Ошибка при создании счета" });
  }
});


async function giveChannelAccess(chatId) {
    if (!chatId) {
        console.log("❌ Ошибка: chatId отсутствует.");
        return;
    }

    try {
        // Генерируем инвайт-ссылку (если канал приватный)
        const inviteLinkResponse = await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/exportChatInviteLink`, {
            chat_id: process.env.CHANNEL_ID
        });

        const inviteLink = inviteLinkResponse.data.result;

        // Отправляем пользователю ссылку-приглашение
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: `✅ Вам выдан доступ к каналу! Нажмите, чтобы присоединиться: ${inviteLink}`
        });

        console.log(`✅ Доступ выдан: ${chatId}`);
    } catch (error) {
        console.error("❌ Ошибка при выдаче доступа:", error.response?.data || error.message);
    }
}

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