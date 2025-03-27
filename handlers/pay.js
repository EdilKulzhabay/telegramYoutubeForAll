const User = require("../models/User.js");
const axios = require('axios')

const generatePaymentLink = (chatId, selectedPlan) => {
  return `https://kulzhabay.kz/pay/${chatId}/${selectedPlan}`;
}

const generateUSDTText = async (selectedPlan) => {
    const price = await fetchProduct("foreign_bank", selectedPlan);
    const address = "`TAPpx1TbLe334nsEhJbV4T9owWuVdsxN2k`"; // Адрес в моноширинном виде

    const text = `Отправьте ${price} USDT

Сеть: TRC-20

Адрес: ${address} (нажмите на адрес, чтобы скопировать его)

‼️ Сумма вывода должна быть не меньше ${price} USDT. То есть, вам нужно отправить так, чтобы дошло не меньше ${price} USDT.

*После оплаты нажмите "Я оплатил"* 👇`;

    return { text, price };
};

const fetchProduct = async (paymentMethod, period) => {
    const productId = "6a336c2b-7992-40d7-8829-67159d4cd3c5";
    try {
        const response = await axios.get("https://api.kulzhabay.kz/getProducts");
        
        const products = response.data.items

        const product = products
            .flatMap(p => p.offers)
            .find(offer => offer.id === productId);

        if (!product) {
            console.error("Продукт не найден");
            return;
        }

        const periodicityMap = {
            "1": "MONTHLY",
            "3": "PERIOD_90_DAYS",
            "12": "PERIOD_YEAR",
        };

        const selectedPeriod = periodicityMap[period] || "MONTHLY";
        const selectedCurrency = paymentMethod === "bank_rf" ? "RUB" : "USD";

        const selectedPrice = product.prices.find(
            p => p.periodicity === selectedPeriod && p.currency === selectedCurrency
        );

        if (selectedPrice) {
            return selectedPrice.amount
        } else {
            console.error("Цена не найдена");
        }
    } catch (error) {
        console.error("Ошибка при получении продукта:", error);
    }
};


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
    
            const { text, price } = await generateUSDTText(user.selectedPlan);
    
            user.history.push(user.currentMenu);
            user.currentMenu = 'USDT';
            user.bybitUIDPrice = price;
            await user.save();
    
            // Объект с параметрами для отправки
            const dynamicMenu = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Я оплатил', callback_data: 'paid' }],
                        // [{ text: 'Инструкция', url: 'https://telegra.ph/Kak-oplatit-podpisku-kriptoj-12-09' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            };
    
            // Отправляем текст с параметрами
            await ctx.reply(text, dynamicMenu);
        } catch (error) {
            console.error('Ошибка в USDT:', error); // Исправил twelveMonths на USDT
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
                text: `Теперь отправьте ХЭШ транзакции (TXID). Вы можете найти его в истории транзакций.

*ХЭШ отображается только после завершения транзакции. Если ХЭШ не отображается, то убедитесь, что транзакция завершена.*`,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            };

            await ctx.replyWithPhoto(
                { source: '/home/ubuntu/telegramYoutubeForAll/txid.jpg' },
                {
                    caption: dynamicMenu.text,
                    reply_markup: dynamicMenu.reply_markup,
                    parse_mode: 'Markdown', // Для поддержки форматирования текста (*курсив*)
                }
            );
        } catch (error) {
            console.error('Ошибка в twelveMonths:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });
  };

module.exports = { registerPayHandlers }