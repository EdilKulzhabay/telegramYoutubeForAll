const registerCommonHandlers = (bot, userStates, menus) => {
    bot.action('back', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId);
  
      if (!state || state.history.length === 0) {
        state.currentMenu = 'start';
        state.history = [];
        userStates.set(chatId, state);
        try {
          await ctx.reply(menus.start.text, menus.start);
        } catch (error) {
          console.error('Error in back to start:', error);
          ctx.reply('Произошла ошибка при возврате.');
        }
        return;
      }
  
      const previousMenu = state.history.pop();
      state.currentMenu = previousMenu;
      userStates.set(chatId, state);
  
      try {
        await ctx.reply(menus[previousMenu].text, menus[previousMenu]);
      } catch (error) {
        console.error('Error in back:', error);
        ctx.reply('Произошла ошибка при возврате назад.');
      }
    });
  
    bot.action('question', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'question';
      userStates.set(chatId, state);
      try {
        await ctx.reply('Нажмите ниже, чтобы задать вопрос:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Открыть форму', web_app: { url: 'https://tibetskayacrm.kz' } }],
            ],
          },
        });
      } catch (error) {
        console.error('Error in question:', error);
        await ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('offer', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'offer';
      userStates.set(chatId, state);
      try {
        await ctx.replyWithDocument({ source: './offer.docx' }, { caption: 'Вот договор оферты' });
      } catch (error) {
        console.error('Error in offer:', error);
        await ctx.reply('Произошла ошибка при отправке договора оферты, попробуйте снова.');
      }
    });
  };

module.exports = { registerCommonHandlers }