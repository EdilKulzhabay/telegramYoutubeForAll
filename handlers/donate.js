const registerDonateHandlers = (bot, userStates, menus) => {
    bot.action('donateBase', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'donateBase';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.donateBase.text, menus.donateBase);
      } catch (error) {
        console.error('Error in donateBase:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('oneMonthDonate', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'oneMonthDonate';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.oneMonthDonate.text, menus.oneMonthDonate);
      } catch (error) {
        console.error('Error in oneMonthDonate:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('sixMonthsDonate', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'sixMonthsDonate';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.sixMonthsDonate.text, menus.sixMonthsDonate);
      } catch (error) {
        console.error('Error in sixMonthsDonate:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  
    bot.action('twelveMonthsDonate', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'twelveMonthsDonate';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.twelveMonthsDonate.text, menus.twelveMonthsDonate);
      } catch (error) {
        console.error('Error in twelveMonthsDonate:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  };

module.exports = { registerDonateHandlers }