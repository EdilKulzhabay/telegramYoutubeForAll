const { 
    start, basePrice, aboutChannel, partnerMenu, donateBase, 
    oneMonth, threeMonthss, twelveMonths, USDT, forFriends, 
    makeContent, referralLinkText2, referralLinkText1, 
    statistics, getMoney, donateText 
} = require('./messages.js');

const menus = {
    start: {
      text: start,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оплатить доступ', callback_data: 'payAccess' }],
          // [{ text: 'Подробнее о канале', callback_data: 'aboutChannel' }],
          // [{ text: 'Меню партнера', callback_data: 'partnerMenu' }],
          // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
          // [{ text: 'Подарить БАЗУ', callback_data: 'donateBase' }],
        ],
      },
    },

    ///////////МЕНЮ ОПЛАТЫ
  
    payAccess: {
      text: basePrice, // Можно заменить на другой текст, если нужно
      reply_markup: {
        inline_keyboard: [
          [{ text: '1 месяц', callback_data: 'oneMonth' }],
          [{ text: '3 месяцев', callback_data: 'threeMonthss' }],
          [{ text: '12 месяцев', callback_data: 'twelveMonths' }],
          [{ text: 'Назад', callback_data: 'back' }],
        ],
      },
    },

    oneMonth: {
        text: oneMonth, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            [{ text: 'USDT (trc-20)', callback_data: 'closed' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    threeMonthss: {
        text: threeMonthss, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            [{ text: 'USDT (trc-20)', callback_data: 'closed' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    twelveMonths: {
        text: twelveMonths, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            [{ text: 'USDT (trc-20)', callback_data: 'closed' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    USDT: {
        text: USDT, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Я оплатил', callback_data: 'closed' }],
            [{ text: 'Инструкция', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },


    /////////////МЕНЮ О КАНАЛЕ
  
    aboutChannel: {
      text: aboutChannel, // Можно заменить на другой текст, если нужно
      reply_markup: {
        inline_keyboard: [
          // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
          [{ text: 'Назад', callback_data: 'back' }],
        ],
      },
    },
  
    //////////МЕНЮ ПАРТНЕРА

    partnerMenu: {
      text: partnerMenu, // Можно заменить на другой текст, если нужно
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Реферальная ссылка', callback_data: 'closed' }],
          [{ text: 'Моя статистика', callback_data: 'closed' }],
          [{ text: 'Создать заявку на вывод средства', callback_data: 'closed' }],
          // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
          [{ text: 'Назад', callback_data: 'back' }],
        ],
      },
    },

    referralLink: {
        text1: referralLinkText1, // Можно заменить на другой текст, если нужно
        text2: referralLinkText2, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Для друзей', callback_data: 'closed' }],
            [{ text: 'Делать контент', callback_data: 'closed' }],
          ],
        },
    },

    forFriends: {
        text: forFriends, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    makeContent: {
        text: makeContent, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    statistics: {
        text: statistics, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    getMoney: {
        text: getMoney, // Можно заменить на другой текст, если нужно
        reply_markup: { 
          inline_keyboard: [
            [{ text: 'Вывести', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    //////////МЕНЮ ДОНАТА
  
    donateBase: {
      text: donateBase, // Можно заменить на другой текст, если нужно
      reply_markup: {
        inline_keyboard: [
          [{ text: '1 месяц', callback_data: 'closed' }],
          [{ text: '3 месяцев', callback_data: 'closed' }],
          [{ text: '12 месяцев', callback_data: 'closed' }],
          [{ text: 'Назад', callback_data: 'back' }],
        ],
      },
    },

    oneMonthDonate: {
        text: donateText, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            //[{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    threeMonthssDonate: {
        text: donateText, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            //[{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },

    twelveMonthsDonate: {
        text: donateText, // Можно заменить на другой текст, если нужно
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Картой (любая валюта)', callback_data: 'closed' }],
            //[{ text: 'USDT (trc-20)', callback_data: 'USDT' }],
            // [{ text: 'Задать вопрос', web_app: { url: 'https://tibetskayacrm.kz' } }],
            [{ text: 'Договор оферты', callback_data: 'closed' }],
            [{ text: 'Назад', callback_data: 'back' }],
          ],
        },
    },
  };

module.exports = { menus }