const { Telegraf } = require('telegraf');
const cron = require('node-cron');
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
const { RestClientV5 } = require('bybit-api');
const Admin = require('./models/Admin.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

const client = new RestClientV5({
  key: process.env.API,
  secret: process.env.SECRET,
  testnet: false,
});

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
const SECRET_KEY = process.env.SECRET_KEY

const userStates = new Map();

function determinePeriod(amount, currency) {
  const tariffs = {
      USD: {
          '1 month': 69,
          '3 months': 200,
          '12 months': 708
      },
      RUB: {
          '1 month': 5839.08,
          '3 months': 16924.86,
          '12 months': 59914
      }
  };

  const tariff = tariffs[currency];
  if (!tariff) return null; // Если валюта неизвестна

  let closestPeriod = null;
  let closestPrice = -Infinity;

  for (const [period, price] of Object.entries(tariff)) {
      if (amount >= price && price > closestPrice) { // Сумма >= тарифа и тариф ближе к сумме
          closestPeriod = period;
          closestPrice = price;
      }
  }

  return closestPeriod; // Возвращаем ближайший подходящий период или null
}

// Функция для расчёта даты окончания подписки
function calculateEndDate(startDate, period) {
  const endDate = new Date(startDate);

  if (period === '1 month') {
      endDate.setMonth(endDate.getMonth() + 1);
  } else if (period === '3 months') {
      endDate.setMonth(endDate.getMonth() + 3);
  } else if (period === '12 months') {
      endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
}

const generateReferralLink = (chatId) => {
  return `https://t.me/${BOT_USERNAME}?start=ref_${chatId}`;
};

bot.start(async (ctx) => {
  await handleStart(ctx);
});

bot.action('start', async (ctx) => {
  await handleStart(ctx);
});

// bot.use((ctx, next) => {
//   const allowedChatId = '1308683371';
//   const currentChatId = ctx.chat?.id.toString();

//   if (currentChatId === allowedChatId) {
//     return next();
//   } else {
//     console.log(`Сообщение от ${currentChatId} проигнорировано, доступ только для ${allowedChatId}`);
//     ctx.reply("В данный момент идут технические работы, пожалуйста, попробуйте через 15 мин")
//     return;
//   }
// });

let stopUpdating = false;

cron.schedule('5 9 * * *', async () => {
  console.log('⏱️ Запуск проверки доступа пользователей...');

  const users = await User.find({ channelAccess: true });

  console.log("users = ", users);
  

  for (const user of users) {
    const latestEvent = await EventHistory.findOne({ 
      $or: [
        { eventType: "bybit", "rawData.txID": user.bybitUID },
        { eventType: "payment.success", "rawData.buyer.email": user.email }
      ]
    }).sort({ timestamp: -1 });

    if ("latestEvent = ", latestEvent)

    if (!latestEvent) continue;

    const amount = latestEvent.rawData.amount
    let currency = "USD"
    if (latestEvent.eventType === 'payment.success') {
      currency = latestEvent.rawData.currency
    }
    let planMonths = 1; // По умолчанию 1 месяц
    if (currency === "USD" && amount > 100 && amount < 500) {
      planMonths = 3; // 3 месяца
    } else if (currency === "USD" && amount > 500) {
      planMonths = 12; // 12 месяцев
    } else if (currency === "RUB" && amount > 12000 && amount < 40000) {
      planMonths = 3; // 3 месяца
    } else if (currency === "RUB" && amount > 40000) {
      planMonths = 12; // 12 месяцев
    }

    // Расчёт даты окончания с запасом на 1 день
    const expiryDate = new Date(latestEvent.timestamp);
    expiryDate.setMonth(expiryDate.getMonth() + planMonths); // Добавляем месяцы
    expiryDate.setDate(expiryDate.getDate() + 1);

    console.log(`У пользователя с id ${user.chatId} и почтой ${user?.email} или txid ${user?.bybitUID} срок окончания ${expiryDate}`);

    if (new Date() > expiryDate) {
      console.log(`У пользователя с id ${user.chatId} и почтой ${user?.email} или txid ${user?.bybitUID} срок окончания ${expiryDate}`);
      
      user.channelAccess = false;
      await user.save();
      try {

        const lastPaymentDate = new Date(latestEvent.timestamp).toLocaleDateString('ru-RU');
        let message = `Пользователь с chatId ${user.chatId} удалён из-за неоплаты.\n`;
        if (user.email) message += `Email: ${user.email}\n`;
        if (user.bybitUID) message += `Bybit UID: ${user.bybitUID}\n`;
        message += `Дата последней оплаты: ${lastPaymentDate}`;

        // Отправляем сообщение администратору с chatId 1308683371
        await bot.telegram.sendMessage('1308683371', message);

        // 1. Уведомление
        await bot.telegram.sendMessage(user.chatId, '⛔️ Срок вашей подписки истёк. Доступ к каналу был отключён. Чтобы продлить доступ, оформите подписку снова.');

        // 2. Исключение из канала
        let isSubscribed = await checkSubscriptionStatus(user.chatId, CHANNEL_ID);
        if (isSubscribed) {
          console.log("isSubscribed true");
          
          await bot.telegram.banChatMember(CHANNEL_ID, user.chatId);
        }

        console.log(`🔒 Пользователь ${user.chatId} отключён и удалён из канала.`);
      } catch (err) {
        console.error(`❌ Не удалось удалить ${user.chatId} из канала или отправить сообщение:`, err.message);
      }
    }
  }

  console.log('✅ Проверка завершена.');
});


async function getUsernameByChatId(chatId) {
  if (stopUpdating) return;
  try {
    const chat = await bot.telegram.getChat(chatId);
    const userName = chat.username; // @username или undefined, если не задан
    const firstName = chat.first_name; // Имя пользователя
    console.log(`Username: ${userName || 'не задан'}, First Name: ${firstName}`);
    const user = await User.findOne({chatId})

    user.userName = userName
    user.firstName = firstName
    await user.save()

    return userName || firstName; // Возвращаем username или имя, если username отсутствует
  } catch (error) {
    console.error('Ошибка при получении информации о чате:', error);
    return null;
  }
}

// Обработчик для слова "start"
bot.hears(/^start$/i, async (ctx) => {
  await handleStart(ctx);
});

bot.hears('Подробнее', async (ctx) => {
  await handleStart(ctx);
});

bot.hears('stopUpdating', async (ctx) => {
  stopUpdating = true;
  await ctx.reply('Обновление имен пользователей остановлено.');
});

bot.hears('getUsernameByChatId', async (ctx) => {
  try {
    await ctx.reply('Начинаю обновление имен пользователей...');

    const users = await User.find();

    await Promise.all(users.map(user => getUsernameByChatId(user.chatId)));

    await ctx.reply('Имена пользователей успешно обновлены!');
  } catch (error) {
    console.error('Ошибка при обновлении имен пользователей:', error);
    await ctx.reply('Произошла ошибка при обновлении имен пользователей.');
  }
});

bot.hears(/^[a-fA-F0-9]{64}$/, async (ctx) => {
  await ctx.reply("Вы отправили txID. Мы его проверяем...");
  const txId = ctx.message.text;
  const chatId = ctx.chat.id;
  const user = await User.findOne({chatId})

  // Логика обработки транзакции
  const {isValid, transaction} = await checkTransaction(txId, chatId);
  // const isValid = "success"
  // const transaction = {
  //     coin: 'USDT',
  //     chain: 'TRX',
  //     amount: '2.6',
  //     txID: 'bfa31bc3246adb35246ed315e623e7aa58e1246b1b9d23e34a9ed01d8a57a5dc',
  //     status: 3,
  //     toAddress: 'TA1Y3FXRGokUVT4bb8DurV5kpTB9rScmj1',
  //     tag: '',
  //     depositFee: '',
  //     successAt: '1742384399000',
  //     confirmations: '51',
  //     txIndex: '0',
  //     blockHash: '000000000434ebd298fdfa92f55f0070d85d804ab869504018a3ad4003336444',
  //     batchReleaseLimit: '-1',
  //     depositType: '0',
  //     fromAddress: 'TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa'
  // }
  console.log("isValid = ", isValid);
  console.log("transaction = ", transaction);
  
  if (isValid === "success") {
    await EventHistory.create({
      eventType: "bybit",
      timestamp: new Date(Date.now()), // Используем timestamp, если есть
      rawData: transaction // Полностью сохраняем весь req.body
    });
    const isBanned = await isUserBanned(CHANNEL_ID, chatId)

    if (isBanned) {
      await unbanUser(CHANNEL_ID, chatId)
    }

    // Обновить пользователя в базе данных
    user.channelAccess = true;
    user.payData.date = new Date(Date.now()); // Преобразуем в объект Date

    await user.save();
    await ctx.reply("Нажмите, чтобы присоединиться: https://t.me/+OKyL_x3DpoY5YmNi")
  } else if (isValid === "scammer") {
    await ctx.reply("⚠️ Такая транзакция уже существует, пожалуйста оплатите и отправьте свою транзакцию.");
  } else if (isValid === "not found") {
    await ctx.reply("⚠️ Ваши USDT ещё не поступили на кошелёк\n\n*зачисление идет от 1 до 5 мин, ожидайте, пожалуйста, и отправьте ХЭШ заново.");
  } else if (isValid === "not enough") {
    await ctx.reply("⚠️ Не правильная оплата, попробуйте еще раз отправить.");
  } else {
    await ctx.reply("⚠️ Ваши USDT ещё не поступили на кошелёк\n\n*зачисление идет от 1 до 5 мин, ожидайте, пожалуйста, и отправьте ХЭШ заново.");
  }
});

async function checkSubscriptionStatus(userId, channelId) {
  try {
      const member = await bot.telegram.getChatMember(channelId, userId);
      return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
      return false; // Предполагаем, что пользователь не подписан, если возникла ошибка
  }
}


// Функция проверки транзакции
async function checkTransaction(txId, chatId) {
  try {
    const candidate = await User.findOne({bybitUID: txId})
    if (candidate) {
      return {isValid: "scammer", transaction: null}
    }
    const response = await client.getDepositRecords({
      coin: 'USDT'
    });

    console.log("response in chatTransaction = ", response);
    

    if (response.retMsg === "success") {
      const transactions = response.result.rows
      console.log("transactions in chatTransaction = ", transactions);
      const transaction = transactions.find((item) => item.txID === txId)
      if (!transaction) {
        return {isValid: "not found", transaction: null}
      }
      const user = await User.findOne({chatId})

      if (transaction.amount < user.bybitUIDPrice) {
        return {isValid: "not enough", transaction: null}
      }

      user.bybitUID = txId
      await user.save()
      return {isValid: "success", transaction}
    } else {
      return {isValid: "error in bybit", transaction: null}
    }
  } catch (error) {
    console.error(`Ошибка при проверке TXID: ${error.message}`);
    return false
  }
}

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

      let responseText = menus.start.text;

      if (user.channelAccess) {
          const event = await EventHistory.findOne({
              $or: [
                  { 'rawData.buyer.email': user.email },
                  { 'rawData.txID': user.bybitUID }
              ]
          }).sort({ timestamp: -1 });

          console.log("event = ", event);

          if (event) {
              const paymentDate = event.timestamp;
              const amount = parseFloat(event.rawData.amount);
              const currency = event.rawData.currency || 'USD';

              const period = determinePeriod(amount, currency);

              console.log("period = ", period);

              if (period) {
                  const endDate = calculateEndDate(paymentDate, period);

                  console.log("endDate = ", endDate);

                  const paymentDateStr = paymentDate.toLocaleDateString('ru-RU');
                  const endDateStr = endDate.toLocaleDateString('ru-RU');

                  // Формируем текст с правильной Markdown-ссылкой
                  responseText = `Твой доступ в Академию "YouTube ДЛЯ ВСЕХ" https://t.me/+OKyL_x3DpoY5YmNi`;
              } 
          } else {
              responseText = `Твой доступ в Академию "YouTube ДЛЯ ВСЕХ" https://t.me/+OKyL_x3DpoY5YmNi`;
          }

          await ctx.reply(responseText, {
              reply_markup: {
                  inline_keyboard: [
                      [{ text: 'Управлять подпиской', callback_data: 'manage_subscription' }],
                  ],
              },
          });
      } else {
          await ctx.sendVideo(
              "BAACAgIAAxkDAAIBoGfQg7RyamGcAjjFU2xzsLaXygclAAKYcgACnHKISkGiUwABzfmF_TYE",
              { caption: "Добро пожаловать! 🎬 Подробности ниже ⬇️" }
          );
          await ctx.reply(responseText, menus.start);
      }

  } catch (error) {
      console.error("Ошибка в /start:", error);
      await ctx.reply("Произошла ошибка, попробуйте снова.");
  }
}

bot.action('manage_subscription', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
      let user = await User.findOne({ chatId });
      if (!user) {
          user = new User({ chatId });
          await user.save();
      }

      user.history.push(user.currentMenu);
      user.currentMenu = 'manage_subscription';
      await user.save();

      let responseText = "";
      let isSubscribed = await checkSubscriptionStatus(chatId, CHANNEL_ID);

      const event = await EventHistory.findOne({
          $or: [
              { 'rawData.buyer.email': user.email },
              { 'rawData.txID': user.bybitUID }
          ]
      }).sort({ timestamp: -1 });

      console.log("event = ", event);

      if (event) {
          const paymentDate = event.timestamp;
          const amount = parseFloat(event.rawData.amount);
          const currency = event.rawData.currency || 'USD';

          const period = determinePeriod(amount, currency);

          console.log("period = ", period);

          if (period) {
              const endDate = calculateEndDate(paymentDate, period);
              const currentDate = new Date();
              const hasActiveAccess = endDate > currentDate;

              console.log("endDate = ", endDate);

              const endDateStr = endDate.toLocaleDateString('ru-RU');

              // Формируем текст с правильной Markdown-ссылкой
              responseText = `Ваша подписка активна до: ${endDateStr}`;

              const inlineKeyboard = [];
                
              inlineKeyboard.push([{ text: 'Отписаться', callback_data: 'unsubscribe' }]);
              inlineKeyboard.push([{ text: 'Я хочу развиваться дальше', callback_data: 'subscribe_back' }]);
              
              // inlineKeyboard.push([{ text: 'Назад', callback_data: 'back' }]);

              await ctx.reply(responseText, {
                  reply_markup: { inline_keyboard: inlineKeyboard }
              });
              return
          }
      } else {
        await ctx.reply("Произошла ошибка при проверке подписки, повторите через 15 мин.");
      }
  } catch (error) {
      console.error('Ошибка в USDT:', error); // Исправил twelveMonths на USDT
      await ctx.reply('Произошла ошибка, попробуйте снова.');
  }
});

// Обработчик отписки
bot.action('unsubscribe', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
      const user = await User.findOne({ chatId });
      if (!user || !user.channelAccess) {
          await ctx.reply('У вас нет активной подписки.');
          return;
      }

      user.history.push(user.currentMenu);
      user.currentMenu = 'unsubscribe';
      await user.save();

      const event = await EventHistory.findOne({
        $and: [
            { 'rawData.buyer.email': user.email },
            { eventType: "payment.success" }
        ]
      }).sort({ timestamp: -1 });

      console.log(event);
      

      if (event) {
        const response = await axios.post(
          "https://gate.lava.top/api/v1/subscriptions",
          {
              contractId: event.rawData.contractId,
              email: event.rawData.buyer.email
          },
          {
              headers: {
                  "Content-Type": "application/json",
                  "X-Api-Key": process.env.X_API_KEY,
              },
          }
        );
        const statusCode = response.status; // Например, 200, 201, 204 и т.д.
        console.log(`Статус ответа: ${statusCode}`);
        console.log('Данные ответа:', response.data);

        // Пример обработки конкретных статусов
        if (statusCode === 400 || statusCode === 401) {
            const dynamicMenu = {
              reply_markup: {
                  inline_keyboard: [
                      [{ text: 'Назад', callback_data: 'back' }],
                  ],
                },
            };
      
            // Отправляем текст с параметрами
            await ctx.reply("Произошла ошибка, повторите попытку через 15 мин", dynamicMenu);
            return
        } 
      }

    const event2 = await EventHistory.findOne({
      $or: [
        { 'rawData.buyer.email': user.email },
        { 'rawData.txID': user.bybitUID }
      ]
    }).sort({ timestamp: -1 });
  
    let endDateStr = 'неизвестно';
    if (event2) {
      const paymentDate = event2.timestamp;
      const amount = parseFloat(event2.rawData.amount);
      const currency = event2.rawData.currency || 'USD';

      // Предполагаемая функция для определения периода подписки
      const period = determinePeriod(amount, currency); // Реализуйте эту функцию
      if (period) {
        const endDate = calculateEndDate(paymentDate, period);
        endDateStr = endDate.toLocaleDateString('ru-RU'); // Формат даты, например, "27.03.2025"
      }
    }

    // await bot.telegram.banChatMember(CHANNEL_ID, chatId);
    
    const message = `Вы успешно отписались. Доступ к каналу сохранится до ${endDateStr}.\n\n` +
                    `Вы можете восстановить подписку после окончания доступа, нажав /start`;

    // Отправляем сообщение
    await ctx.reply(message);
      
  } catch (error) {
      console.error('Ошибка при отписке:', error);
      await ctx.reply('Произошла ошибка при отписке, попробуйте снова.');
  }
});

// Обработчик возвращения на канал
bot.action('subscribe_back', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
      // const user = await User.findOne({ chatId });
      // if (!user || !user.channelAccess) {
      //     await ctx.reply('У вас нет активного доступа для возвращения на канал.');
      //     return;
      // }

      // user.history.push(user.currentMenu);
      // user.currentMenu = 'subscribe_back';
      // await user.save();

      // // Проверяем, не истек ли срок подписки
      // const event = await EventHistory.findOne({
      //     $or: [
      //         { 'rawData.buyer.email': user.email },
      //         { 'rawData.txID': user.bybitUID }
      //     ]
      // }).sort({ timestamp: -1 });

      // if (event) {
      //     const paymentDate = event.timestamp;
      //     const amount = parseFloat(event.rawData.amount);
      //     const currency = event.rawData.currency || 'USD';
      //     const period = determinePeriod(amount, currency);
      //     const endDate = calculateEndDate(paymentDate, period);
      //     const currentDate = new Date();

      //     if (endDate > currentDate) {
      //       await bot.telegram.unbanChatMember(CHANNEL_ID, chatId);
      //       await ctx.reply('Добро пожаловать обратно! Вы снова добавлены в канал.', {
      //           reply_markup: {
      //               inline_keyboard: [[{ text: 'Перейти на канал', url: 'https://t.me/+OKyL_x3DpoY5YmNi' }]]
      //           }
      //       });
      //     } else {
      //       user.channelAccess = false;
      //       await user.save();
      //       await ctx.reply('Срок вашей подписки истек. Оформите новую подписку для доступа к каналу.', {
      //         reply_markup: {
      //           inline_keyboard: [[{ text: 'Оформить новую подписку', callback_data: 'start' }]]
      //         }
      //       });
      //     }
      // }
      await ctx.reply('Отличное решение')
  } catch (error) {
      console.error('Ошибка при возвращении на канал:', error);
      await ctx.reply('Произошла ошибка при возвращении на канал, попробуйте снова.');
  }
});

// Функция проверки статуса подписки



bot.on("chat_join_request", async (ctx) => {
  try {
      const user = ctx.chatJoinRequest.from;
      const chatId = user.id;
      const groupId = CHANNEL_ID // ID группы

      console.log(`Запрос на вступление: ${user.first_name} (@${user.username})`);

      // Проверяем, есть ли пользователь в базе данных
      let dbUser = await User.findOne({ chatId });

      if (!dbUser) {
          dbUser = new User({ chatId, channelAccess: false });
          await dbUser.save();
      }

      // Проверяем, состоит ли уже в группе
      try {
          const member = await ctx.telegram.getChatMember(groupId, chatId);

          if (["member", "administrator", "creator"].includes(member.status)) {
              console.log(`✅ Пользователь уже в группе: ${user.first_name} (@${user.username})`);
              return; // Выходим, если пользователь уже в группе
          }
      } catch (error) {
          console.warn(`⚠️ Ошибка при проверке статуса пользователя: ${error.message}`);
      }

      if (dbUser.channelAccess) {
          // Если у пользователя есть доступ — одобряем заявку
          await ctx.telegram.approveChatJoinRequest(groupId, chatId);
          console.log(`✅ Доступ выдан: ${user.first_name} (@${user.username})`);
      } else {
          // Если доступа нет — проверяем, не в бане ли он
          const isBanned = await isUserBanned(groupId, chatId);

          if (isBanned) {
              await unbanUser(groupId, chatId);
          }

          await ctx.telegram.declineChatJoinRequest(groupId, chatId);
          await ctx.telegram.sendMessage(
              chatId,
              `Для доступа к Образовательному сообществу "YouTube для ВСЕХ" вам необходимо оформить подписку.`,
              {
                  reply_markup: {
                      keyboard: [[{ text: "Подробнее" }]],
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

        const isBanned = await isUserBanned(CHANNEL_ID, chatId)

        if (isBanned) {
          await unbanUser(CHANNEL_ID, chatId)
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

      const isBanned = await isUserBanned(CHANNEL_ID, chatId)

      if (isBanned) {
        await unbanUser(CHANNEL_ID, chatId)
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
      await unbanUser(CHANNEL_ID, "1308683371")
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

app.post("/getHistories", async (req, res) => {
  try {
    const { email, hash, page = 1 } = req.body;
    const filter = {};
    const limit = 10

    if (email) filter["rawData.buyer.email"] = email;
    if (hash) filter["rawData.txID"] = hash;

    const totalCount = await EventHistory.countDocuments(filter);
    const histories = await EventHistory.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      histories,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, message: "Неверные учетные данные" });
  }
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "10y" });
  res.json({ success: true, token });
});

// Проверка токена
app.post("/verifyToken", async (req, res) => {
  const { token } = req.body;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.json({ valid: false });
      res.json({ valid: true, email: decoded.email });
  });
});

async function sendMessageWithDelay(chatId, text, delayMs = 100) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
        resolve(true);
      } catch (error) {
        console.error(`Ошибка отправки сообщения пользователю ${chatId}:`, error);
        resolve(false);
      }
    }, delayMs);
  });
}

// Функция для выполнения рассылки
async function broadcastMessage(status, message) {
  try {
    const filter = {};
    if (status === "subscriptions") filter["channelAccess"] = true;
    if (status === "unsubscriptions") filter["channelAccess"] = false;

    const users = await User.find(filter)

    // Отправляем сообщение каждому пользователю с небольшой задержкой
    for (const user of users) {
      await sendMessageWithDelay(user.chatId, message);
    }
  } catch (error) {
    console.error('Ошибка при выполнении рассылки:', error);
  }
}

app.post("/broadcast", async(req, res) => {
  try {
    const { status, message } = req.body;
    await broadcastMessage(status, message)

    res.json({success: true});
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
})

app.post("/getUsers", async(req, res) => {
  try {
    const { status } = req.body;

    const filter = {};
    if (status === "subscriptions") filter["channelAccess"] = true;
    if (status === "unsubscriptions") filter["channelAccess"] = false;

    const users = await User.find(filter)

    res.json({success: true, users});
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
})

app.post("/searchUser", async(req, res) => {
  try {
    const { userName } = req.body;

    const users = await User.find({
      $or: [
        { userName: { $regex: new RegExp(userName, 'i') } }, // Частичное совпадение для userName
        { firstName: { $regex: new RegExp(userName, 'i') } } // Частичное совпадение для firstName
      ]
    });

    res.json({success: true, users});
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
})

const PORT = process.env.PORT || 3006;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});