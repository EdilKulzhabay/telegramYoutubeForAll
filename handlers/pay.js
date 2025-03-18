const User = require("../models/User.js");
const {getSubDepositAddress2} = require("../bybit.js")

const generatePaymentLink = (chatId, selectedPlan) => {
  return `https://kulzhabay.kz/pay/${chatId}/${selectedPlan}`;
}

const registerPayHandlers = (bot, menus) => {
    bot.action('payAccess', async (ctx) => {
      const chatId = ctx.chat.id;
        try {
            let user = await User.findOne({ chatId });
            if (!user) {
                user = new User({ chatId });
                await user.save();
            }

            user.history.push(user.currentMenu);
            user.currentMenu = 'payAccess';
            await user.save();

            await ctx.reply(menus.payAccess.text, menus.payAccess);
        } catch (error) {
            console.error('Ошибка в payAccess:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });
  
    bot.action('oneMonth', async (ctx) => {
      const chatId = ctx.chat.id;
      try {
          let user = await User.findOne({ chatId });
          if (!user) {
              user = new User({ chatId });
              await user.save();
          }

          user.history.push(user.currentMenu);
          user.currentMenu = 'oneMonth';
          user.selectedPlan = 1;
          await user.save();

          const paymentUrl = generatePaymentLink(chatId, user.selectedPlan);

          const dynamicMenu = {
              text: menus.oneMonth.text,
              reply_markup: {
                  inline_keyboard: [
                      [{ text: '💳 Картой (любая валюта)', url: paymentUrl }],
                      [{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
                      [{ text: 'Договор оферты', url: 'https://yt-filatov.com/public-offer' }],
                      [{ text: 'Назад', callback_data: 'back' }],
                  ],
              },
          };

          await ctx.reply(dynamicMenu.text, dynamicMenu);
      } catch (error) {
          console.error('Ошибка в oneMonth:', error);
          await ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('threeMonthss', async (ctx) => {
      const chatId = ctx.chat.id;
      try {
          let user = await User.findOne({ chatId });
          if (!user) {
              user = new User({ chatId });
              await user.save();
          }

          user.history.push(user.currentMenu);
          user.currentMenu = 'threeMonthss';
          user.selectedPlan = 3;
          await user.save();

          const paymentUrl = generatePaymentLink(chatId, user.selectedPlan);

          const dynamicMenu = {
              text: menus.threeMonthss.text,
              reply_markup: {
                  inline_keyboard: [
                      [{ text: '💳 Картой (любая валюта)', url: paymentUrl }],
                      [{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
                      [{ text: 'Договор оферты', url: 'https://yt-filatov.com/public-offer' }],
                      [{ text: 'Назад', callback_data: 'back' }],
                  ],
              },
          };

          await ctx.reply(dynamicMenu.text, dynamicMenu);
      } catch (error) {
          console.error('Ошибка в twelveMonths:', error);
          await ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('twelveMonths', async (ctx) => {
      const chatId = ctx.chat.id;
        try {
            let user = await User.findOne({ chatId });
            if (!user) {
                user = new User({ chatId });
                await user.save();
            }

            user.history.push(user.currentMenu);
            user.currentMenu = 'twelveMonths';
            user.selectedPlan = 12;
            await user.save();

            const paymentUrl = generatePaymentLink(chatId, user.selectedPlan);

            const dynamicMenu = {
                text: menus.twelveMonths.text,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💳 Картой (любая валюта)', url: paymentUrl }],
                        [{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
                        [{ text: 'Договор оферты', url: 'https://yt-filatov.com/public-offer' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            };

            await ctx.reply(dynamicMenu.text, dynamicMenu);
        } catch (error) {
            console.error('Ошибка в twelveMonths:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });
  
    bot.action('USDT', async (ctx) => {
        const chatId = ctx.chat.id;
        try {
            let user = await User.findOne({ chatId });
            if (!user) {
                user = new User({ chatId });
                await user.save();
            }

            user.history.push(user.currentMenu);
            user.currentMenu = 'USDT';

            const uid = await getSubDepositAddress2(chatId)

            user.bybitUID = uid
            
            await user.save();

            const text = `Отправьте
80 USDT в сети TRC-20
На адрес:
${uid}

*кликните на номер счета и он скопируется

После оплаты нажмите Я оплатил 👇

*Обязательно проверьте адрес кошелька
`

            const dynamicMenu = {
                text,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Я оплатил', callback_data: 'paid' }],
                        [{ text: 'Инструкция', url: 'https://telegra.ph/Kak-oplatit-podpisku-kriptoj-12-09' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            };

            await ctx.reply(dynamicMenu.text, dynamicMenu);
        } catch (error) {
            console.error('Ошибка в twelveMonths:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });

    bot.action('paid', async (ctx) => {
        const chatId = ctx.chat.id;
        try {
            let user = await User.findOne({ chatId });
            if (!user) {
                user = new User({ chatId });
                await user.save();
            }

            user.history.push(user.currentMenu);
            user.currentMenu = 'paid';
            await user.save();

            const dynamicMenu = {
                text: menus.threeMonthss.text,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Я оплатил', callback_data: 'paid' }],
                        [{ text: 'Инструкция', url: 'https://telegra.ph/Kak-oplatit-podpisku-kriptoj-12-09' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            };

            await ctx.reply(dynamicMenu.text, dynamicMenu);
        } catch (error) {
            console.error('Ошибка в twelveMonths:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });
  };

module.exports = { registerPayHandlers }