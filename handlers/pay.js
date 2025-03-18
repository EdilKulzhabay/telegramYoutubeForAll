const { default: axios } = require("axios");
const User = require("../models/User.js");
const { RestClientV5 } = require('bybit-api');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const client = new RestClientV5({
  key: process.env.API,
  secret: process.env.SECRET,
  testnet: false,
});

const generatePaymentLink = (chatId, selectedPlan) => {
  return `https://kulzhabay.kz/pay/${chatId}/${selectedPlan}`;
}

const generateTextForUSDT = (price, address) => {
    return `Отправьте
${price} USDT в сети TRC-20
На адрес:
\`${address}\`

*кликните на номер счета и он скопируется

После оплаты нажмите Я оплатил 👇

*Обязательно проверьте адрес кошелька`
} 

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

            const {address, uid} = await getSubDepositAddress(chatId)

            user.bybitUID = uid
            const price = await fetchProduct("foreign_bank", user.selectedPlan)
            user.bybitUIDPrice = price

            await user.save();

            const text =  generateTextForUSDT(price, address)
            const dynamicMenu = {
                text,
                parse_mode: "Markdown",
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

            const isPaid = checkPay(user.bybitUID, user.bybitUIDPrice)

            if (isPaid) {
                const transferResponse = await transferFunds(user.bybitUID, user.bybitUIDPrice)

                if (transferResponse) {
                    const deleteResponse = await deleteSubAccount(user.bybitUID)
                    if (deleteResponse) {
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
                        })
                    } else {
                        console.log("Ошибка при удалении в pay.js");
                    }
                } else {
                    console.log("Ошибка при переводе денег на основной счет в pay.js");
                }

            } else {
                const dynamicMenu = {
                    text: `Ваши USDT ещё не поступили на кошелёк

*зачисление идет от 1 до 5 мин, ожидайте, пожалуйста, и проверьте снова`,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Проверить еще раз', callback_data: 'paid' }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ],
                    },
                };
                await ctx.reply(dynamicMenu.text, dynamicMenu);
            }

            
        } catch (error) {
            console.error('Ошибка в twelveMonths:', error);
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
    });
  };

async function getSubDepositAddress(clientId) {
    try {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const uniqueUsername = `${clientId}${randomSuffix}`;
      const res = await client.createSubMember({ username: uniqueUsername, memberType: 1 });
      console.log('Ответ от createSubMember:', JSON.stringify(res));
      if (res.retCode === 0) {
        console.log(`Субаккаунт для ${clientId} создан с UID: ${res.result.uid}`);
        const uid = res.result.uid
        const response = await client.getSubDepositAddress('USDT', 'TRX', String(uid));
      
        if (response.retCode === 0) {
          const TRXAddress = response.result.chains.addressDeposit;
          console.log('Адрес суб аккаунта:', TRXAddress);
          if (!TRXAddress) {
            console.error(`Адрес TRX для ${uid} не найден`);
            return null;
          }
          return {address: TRXAddress, uid};
        } else {
          console.error(`Ошибка получения адреса для ${uid}: ${response.retMsg}`);
          return null;
        }
      } else {
        console.error(`Ошибка создания субаккаунта для ${clientId}: ${res.retMsg}`);
        return null;
      }
    } catch (error) {
      console.error(`Ошибка: ${error.message}`);
      return null;
    }
}

const fetchProduct = async (paymentMethod, period) => {
    const productId = "6a336c2b-7992-40d7-8829-67159d4cd3c5";
    try {
        const response = await axios.get("https://api.kulzhabay.kz/getProducts");
        console.log("response in Pay = ", response);
        
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

async function checkPay(subUid, fixedAmount) {
    try {
        const response = await client.getSubAccountDepositRecords({ subMemberId: subUid, coin: 'USDT' });
        if (response.retCode === 0) {
            if (response.result.rows.length === 0) {
                return false
            }
            const paid = response.result.rows.some((d) => parseFloat(d.amount) >= fixedAmount);
            return paid;
        } else {
            console.error(`Ошибка проверки депозита для ${subUid}: ${response.retMsg}`);
            return false;
        }
    } catch (error) {
        console.error(`Ошибка: ${error.message}`);
        return false;
    }
}

async function transferFunds(subUid, fixedAmount) {
    try {
      const response = await client.createUniversalTransfer({
        transferId: randomUUID(),
        coin: 'USDT',
        amount: fixedAmount.toString(),
        fromMemberId: subUid,
        toMemberId: '441931017',
        fromAccountType: 'FUND',    // Изменено на FUND, где есть USDT
        toAccountType: 'UNIFIED',   // Оставляем UNIFIED для главного аккаунта
      });
  
      if (response.retCode === 0) {
        console.log("response = ", response);
        console.log(`Средства с субаккаунта ${subUid} переведены на основной аккаунт`);
        return true;
      } else {
        console.error(`Ошибка перевода средств для ${subUid}: ${response.retMsg}`);
        console.log("response = ", response);
        return false;
      }
    } catch (error) {
      console.error(`Ошибка: ${error.message}`);
      return false;
    }
  }

async function deleteSubAccount(subUid) {
try {
    const response = await client.deleteSubMember({ subMemberId: subUid });
    if (response.retCode === 0) {
    console.log(`Субаккаунт ${subUid} удалён`);
    return true;
    } else {
    console.error(`Ошибка удаления субаккаунта ${subUid}: ${response.retMsg}`);
    return false;
    }
} catch (error) {
    console.error(`Ошибка: ${error.message}`);
    return false;
}
}

module.exports = { registerPayHandlers }