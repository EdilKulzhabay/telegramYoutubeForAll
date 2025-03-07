export const registerAboutHandlers = (bot, userStates, menus) => {
    bot.action('aboutChannel', async (ctx) => {
      const chatId = ctx.chat.id;
      const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
      state.history.push(state.currentMenu);
      state.currentMenu = 'aboutChannel';
      userStates.set(chatId, state);
      try {
        await ctx.reply(menus.aboutChannel.text, menus.aboutChannel);
      } catch (error) {
        console.error('Error in aboutChannel:', error);
        ctx.reply('Произошла ошибка, попробуйте снова.');
      }
    });
  };