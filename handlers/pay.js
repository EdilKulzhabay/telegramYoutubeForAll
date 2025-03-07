export const registerPayHandlers = (bot, userStates, menus) => {
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
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.oneMonth.text, menus.oneMonth);
      } catch (error) {
        console.error('Error in oneMonth:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('sixMonths', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'sixMonths';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.sixMonths.text, menus.sixMonths);
      } catch (error) {
        console.error('Error in sixMonths:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('twelveMonths', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'twelveMonths';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.twelveMonths.text, menus.twelveMonths);
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