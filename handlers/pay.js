const generatePaymentLink = (chatId, selectedPlan) => {
  return `https://kulzhabay.kz/pay/${chatId}/${selectedPlan}`;
}

const registerPayHandlers = (bot, userStates, menus) => {
    bot.action('payAccess', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'payAccess';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.payAccess.text, menus.payAccess);
      } catch (error) {
        console.error('Error in payAccess:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('oneMonth', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'oneMonth';
      state.selectedPlan = 1;
      userStates.set(chatId, state);
      try {
        const selectedPlan = state.selectedPlan;
        const paymentUrl = generatePaymentLink(chatId, selectedPlan);
  
        // Обновляем меню с динамической ссылкой
        const dynamicMenu = {
          text: menus.oneMonth.text,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Картой (любая валюта)', web_app: { url: paymentUrl } }],
              [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
              [{ text: 'Договор оферты', callback_data: 'offer' }],
              [{ text: 'Назад', callback_data: 'back' }],
            ],
          },
        };
  
        await ctx.reply(dynamicMenu.text, dynamicMenu);
      } catch (error) {
        console.error('Error in oneMonth:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('threeMonthss', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'threeMonths';
      state.selectedPlan = 3;
      userStates.set(chatId, state);
      try {
        const selectedPlan = state.selectedPlan;
        const paymentUrl = generatePaymentLink(chatId, selectedPlan);
  
        // Обновляем меню с динамической ссылкой
        const dynamicMenu = {
          text: menus.oneMonth.text,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Картой (любая валюта)', web_app: { url: paymentUrl } }],
              [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
              [{ text: 'Договор оферты', callback_data: 'offer' }],
              [{ text: 'Назад', callback_data: 'back' }],
            ],
          },
        };
  
        await ctx.reply(dynamicMenu.text, dynamicMenu);
      } catch (error) {
        console.error('Error in threeMonthss:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('twelveMonths', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'twelveMonths';
      state.selectedPlan = 12;
      userStates.set(chatId, state);
      try {
        const selectedPlan = state.selectedPlan;
        const paymentUrl = generatePaymentLink(chatId, selectedPlan);
  
        // Обновляем меню с динамической ссылкой
        const dynamicMenu = {
          text: menus.oneMonth.text,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Картой (любая валюта)', web_app: { url: paymentUrl } }],
              [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
              [{ text: 'Договор оферты', callback_data: 'offer' }],
              [{ text: 'Назад', callback_data: 'back' }],
            ],
          },
        };
  
        await ctx.reply(dynamicMenu.text, dynamicMenu);
      } catch (error) {
        console.error('Error in twelveMonths:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('USDT', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'USDT';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.USDT.text, menus.USDT);
      } catch (error) {
        console.error('Error in USDT:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  };

module.exports = { registerPayHandlers }