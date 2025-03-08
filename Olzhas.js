const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");
const logger = require("firebase-functions/logger");

// Секреты
const salebotApiKey = defineSecret("FILATOV_SALEBOT_API_KEY");
const lavaApiKey = defineSecret("FILATOV_LAVA_API_KEY");
const webhookKey = defineSecret("FILATOV_WEBHOOK_KEY");

// Конфигурация
const APP_CONFIG = {
  salebot: {
    baseUrl: "https://chatter.salebot.pro/api",  // Базовый URL для всех запросов
    callbackPath: "/#{api_key}/callback",        // Паттерн для колбэка
    findClientPath: "/#{api_key}/find_client_id_by_var"  // Паттерн для поиска
  },
  lava: {
    baseUrl: "https://gate.lava.top",
    allowedIPs: ["158.160.60.174"]
  }
};

// Вспомогательные функции
async function sendSalebotCallback(clientId, variables, message) {
  try {
    const callbackUrl = APP_CONFIG.salebot.baseUrl + 
      APP_CONFIG.salebot.callbackPath.replace("#{api_key}", salebotApiKey.value());
    
    // Формируем тело запроса согласно рабочему примеру
    const requestBody = {
      client_id: clientId,
      message: message,
      ...variables  // Распаковываем все переменные на верхний уровень
    };

    // Убираем вложенность variables
    await axios.post(callbackUrl, requestBody);
    
    logger.log("Колбэк успешно отправлен", { 
      clientId: clientId,
      message: message 
    });

  } catch (error) {
    logger.error("Ошибка отправки колбэка", {
      error: error.message,
      url: error.config?.url,
      requestData: error.config?.data
    });
  }
}

async function cancelSubscription(contractId, email) {
  try {
    await axios.delete(`${APP_CONFIG.lava.baseUrl}/api/v1/subscriptions`, {
      params: { contractId, email },
      headers: { "X-Api-Key": lavaApiKey.value() }
    });
    return true;
  } catch (error) {
    logger.error("Ошибка отмены подписки", { contractId, error });
    return false;
  }
}

// Обновленная функция поиска client_id
async function findClientIdByContractId(contractId) {
  try {
    const findClientUrl = APP_CONFIG.salebot.baseUrl + 
      APP_CONFIG.salebot.findClientPath.replace("#{api_key}", salebotApiKey.value());
    
    const response = await axios.get(findClientUrl, {
      params: {
        var: 'lava_contract_id',
        val: contractId,
        search_in: 'order'
      }
    });
    
    if (response.data?.status === 'success') {
      return response.data.client_id;
    }
    return null;
    
  } catch (error) {
    logger.error("Ошибка поиска клиента", {
      error: error.message,
      url: error.config?.url
    });
    return null;
  }
}

// Обработчики функций
exports.lavaTopWebhook = onRequest(
  { secrets: [salebotApiKey, lavaApiKey, webhookKey], timeoutSeconds: 60 },
  async (req, res) => {
    try {
      // Проверка IP-адреса
      if (!APP_CONFIG.lava.allowedIPs.includes(req.ip)) {
        logger.warn("Доступ с запрещенного IP", { ip: req.ip });
        return res.status(403).send("Forbidden");
      }

      // Проверка API-ключа
      if (req.headers["x-api-key"] !== webhookKey.value()) {
        logger.warn("Неверный API-ключ вебхука", { headers: req.headers });
        return res.status(401).send("Unauthorized");
      }

      const webhookData = req.body;
      logger.log("Получен вебхук", webhookData);

      // Определение типа события
      const eventMessages = {
        "payment.success": (data) => data.product?.type === "SUBSCRIPTION" 
          ? "subscription_created" 
          : "payment_success",
        "payment.failed": (data) => data.product?.type === "SUBSCRIPTION"
          ? "subscription_creation_failed"
          : "payment_failed",
        "subscription.recurring.payment.success": "subscription_payment_success",
        "subscription.recurring.payment.failed": "subscription_payment_failed",
        "subscription.cancelled": "subscription_cancelled",
        "subscription.expired": "subscription_expired"
      };

      const message = typeof eventMessages[webhookData.eventType] === "function"
        ? eventMessages[webhookData.eventType](webhookData)
        : eventMessages[webhookData.eventType] || `unknown_event_${webhookData.eventType}`;

      // Формирование переменных
      const variables = {
        lava_contract_id: webhookData.contractId,
        lava_parent_contract_id: webhookData.parentContractId,
        lava_product_type: webhookData.product?.type,
        lava_amount: webhookData.amount,
        lava_email: webhookData.buyer?.email,
        lava_utm_source: webhookData.clientUtm?.utm_source,
        lava_error: webhookData.errorMessage
      };

      // Ищем client_id по contractId
      const clientId = await findClientIdByContractId(webhookData.contractId);
      
      if (!clientId) {
        logger.error("Клиент не найден в Salebot", { contractId: webhookData.contractId });
        return res.status(404).send("Client not found");
      }

      // Обновляем отправку колбека
      await sendSalebotCallback(
        clientId, // Используем найденный client_id вместо contractId
        variables,
        message
      );

      res.status(200).send("OK");
    } catch (error) {
      logger.error("Ошибка обработки вебхука", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

exports.cancelSubscription = onRequest(
  { secrets: [salebotApiKey, lavaApiKey] },
  async (req, res) => {
    try {
      // Авторизация
      if (req.headers.authorization !== `Bearer ${salebotApiKey.value()}`) {
        return res.status(401).send("Unauthorized");
      }

      // Валидация параметров
      const { contractId, email } = req.query;
      if (!contractId || !email) {
        return res.status(400).json({
          error: "Требуются contractId и email",
          example: "/cancelSubscription?contractId=LAVA_123&email=test@mail.ru"
        });
      }

      // Отмена подписки
      const success = await cancelSubscription(contractId, email);
      
      if (success) {
        res.json({ status: "subscription_cancelled" });
      } else {
        res.status(500).json({ error: "Не удалось отменить подписку" });
      }
    } catch (error) {
      logger.error("Ошибка отмены подписки", error);
      res.status(500).send("Internal Server Error");
    }
  }
);