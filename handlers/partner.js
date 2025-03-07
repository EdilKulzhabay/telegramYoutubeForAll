import User from '../models/User.js'; // Импортируем модель пользователя

export const registerPartnerHandlers = (bot, userStates, menus) => {
  bot.action('partnerMenu', async (ctx) => {
    const chatId = ctx.chat.id;
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'partnerMenu';
    userStates.set(chatId, state);
    try {
      await ctx.reply(menus.partnerMenu.text, menus.partnerMenu);
    } catch (error) {
      console.error('Error in partnerMenu:', error);
      ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });

  bot.action('referralLink', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'referralLink';
    userStates.set(chatId, state);
    try {
      await ctx.reply(menus.referralLink.text1)
      await ctx.reply(menus.referralLink.text2, menus.referralLink);
    } catch (error) {
      console.error('Error in referralLink:', error);
      await ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });

  bot.action('forFriends', async (ctx) => {
    const chatId = ctx.chat.id;
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'forFriends';
    userStates.set(chatId, state);
    const user = await User.findOne({chatId})
    const text = `Твоя реферальная ссылка 👇
${user.refferal}

*партнерка работает для нового трафика, клики и оплаты учитываются, если человек еще не был в моем боте`
    try {
      await ctx.reply(text, menus.forFriends);
    } catch (error) {
      console.error('Error in forFriends:', error);
      ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });

  bot.action('makeContent', async (ctx) => {
    const chatId = ctx.chat.id;
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'makeContent';
    userStates.set(chatId, state);
    const user = await User.findOne({chatId})
    const text = `Твоя реферальная ссылка 👇
${user.refferal}

🚀 Заходи в канал для нарезчиков https://t.me/+ZcepyvOE0O4wNjc6, там я выкладываю рекомендации, как больше заработать с моей партнеркой

*партнерка работает для нового трафика, клики и оплаты учитываются, если человек еще не был в моем боте`
    try {
      await ctx.reply(text, menus.makeContent);
    } catch (error) {
      console.error('Error in makeContent:', error);
      ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });

  bot.action('statistics', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'statistics';
    userStates.set(chatId, state);
    try {
      const user = await User.findOne({ chatId });
      const text = `Ваша статистика:\nПриглашено: ${user.refferalBonus}`;
      await ctx.reply(text, menus.statistics);
    } catch (error) {
      console.error('Error in statistics:', error);
      await ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });

  bot.action('getMoney', async (ctx) => {
    const chatId = ctx.chat.id;
    const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    state.history.push(state.currentMenu);
    state.currentMenu = 'getMoney';
    userStates.set(chatId, state);
    try {
      await ctx.reply(menus.getMoney.text, menus.getMoney);
    } catch (error) {
      console.error('Error in getMoney:', error);
      ctx.reply('Произошла ошибка, попробуйте снова.');
    }
  });
};