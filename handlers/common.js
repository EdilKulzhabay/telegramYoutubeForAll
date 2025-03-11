const User = require("../models/User.js");

const registerCommonHandlers = (bot, menus) => {
  bot.action('back', async (ctx) => {
    const chatId = ctx.chat.id;
    try {
        let user = await User.findOne({ chatId });
        if (!user) {
            user = new User({ chatId });
            await user.save();
        }

        if (user.history.length === 0) {
            user.currentMenu = 'start';
            user.history = [];
            await user.save();
            return await ctx.reply(menus.start.text, menus.start);
        }

        // Извлекаем предыдущее меню из истории
        user.currentMenu = user.history.pop();
        await user.save();

        await ctx.reply(menus[user.currentMenu].text, menus[user.currentMenu]);
    } catch (error) {
        console.error('Ошибка при возврате назад:', error);
        await ctx.reply('Произошла ошибка при возврате назад.');
    }
});
  
    // bot.action('question', async (ctx) => {
    //   const chatId = ctx.chat.id;
    //   const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    //   state.history.push(state.currentMenu);
    //   state.currentMenu = 'question';
    //   userStates.set(chatId, state);
    //   try {
    //     await ctx.reply('Нажмите ниже, чтобы задать вопрос:', {
    //       reply_markup: {
    //         inline_keyboard: [
    //           [{ text: 'Открыть форму', web_app: { url: 'https://tibetskayacrm.kz' } }],
    //         ],
    //       },
    //     });
    //   } catch (error) {
    //     console.error('Error in question:', error);
    //     await ctx.reply('Произошла ошибка, попробуйте снова.');
    //   }
    // });
  
    // bot.action('offer', async (ctx) => {
    //   const chatId = ctx.chat.id;
    //   const state = userStates.get(chatId) || { currentMenu: 'start', history: [] };
    //   state.history.push(state.currentMenu);
    //   state.currentMenu = 'offer';
    //   userStates.set(chatId, state);
    //   try {
    //     await ctx.replyWithDocument({ source: './offer.docx' }, { caption: 'Вот договор оферты' });
    //   } catch (error) {
    //     console.error('Error in offer:', error);
    //     await ctx.reply('Произошла ошибка при отправке договора оферты, попробуйте снова.');
    //   }
    // });
  };

module.exports = { registerCommonHandlers }