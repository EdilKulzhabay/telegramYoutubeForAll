import { RestClientV5 } from 'bybit-api';
import 'dotenv/config';

const client = new RestClientV5({
  key: process.env.API,
  secret: process.env.SECRET,
  testnet: false,
});

async function cleanSubAccounts() {
  try {
    const response = await client.getSubUIDList();
    if (response.retCode === 0) {
      const subAccounts = response.result.subMemberList || []; // Если undefined, используем пустой массив
      if (subAccounts.length === 0) {
        console.log('Субаккаунтов для удаления нет');
        return;
      }
      for (const sub of subAccounts) {
        await deleteSubAccount(sub.subUid);
      }
      console.log('Все существующие субаккаунты удалены');
    } else {
      console.error(`Ошибка получения списка субаккаунтов: ${response.retMsg}`);
    }
  } catch (error) {
    console.error(`Ошибка очистки субаккаунтов: ${error.message}`);
  }
}

async function createSubAccount(clientId) {
  try {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const uniqueUsername = `${clientId}${randomSuffix}`;
    const response = await client.createSubMember({ username: uniqueUsername, memberType: 1 });
    console.log('Ответ от createSubMember:', JSON.stringify(response));
    if (response.retCode === 0) {
      console.log(`Субаккаунт для ${clientId} создан с UID: ${response.result.uid}`);
      return response.result.uid;
    } else {
      console.error(`Ошибка создания субаккаунта для ${clientId}: ${response.retMsg}`);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    return null;
  }
}

async function getSubDepositAddress(subUid) {
  try {
    console.log(`Получение адреса для subUid: ${subUid}`);
    const response = await client.getSubDepositAddress('USDT', 'TRC20', String(subUid));
    console.log('Ответ от API:', JSON.stringify(response));
    if (response.retCode === 0) {
      const trc20Address = response.result.chains.find((chain) => chain.chain === 'TRC20')?.addressDeposit;
      if (!trc20Address) {
        console.error(`Адрес TRC20 для ${subUid} не найден`);
        return null;
      }
      return trc20Address;
    } else {
      console.error(`Ошибка получения адреса для ${subUid}: ${response.retMsg}`);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    return null;
  }
}

async function checkSubAccountDeposit(subUid, fixedAmount) {
  try {
    const response = await client.getSubAccountDepositRecords({ subMemberId: subUid, coin: 'USDT' });
    if (response.retCode === 0) {
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
    const response = await client.createInternalTransfer({
      transferId: `transfer-${Date.now()}`,
      coin: 'USDT',
      amount: fixedAmount.toString(),
      fromMemberId: subUid,
      toMemberId: 'main', // Перевод на основной аккаунт
    });
    if (response.retCode === 0) {
      console.log(`Средства с субаккаунта ${subUid} переведены на основной аккаунт`);
      return true;
    } else {
      console.error(`Ошибка перевода средств для ${subUid}: ${response.retMsg}`);
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

async function processClientPayments(clients, fixedAmount) {
  const clientPayments = {};
  let activeSubAccounts = 0;
  const MAX_SUB_ACCOUNTS = 20;

  await cleanSubAccounts();

  for (const c of clients) {
    if (activeSubAccounts >= MAX_SUB_ACCOUNTS) {
      console.log('Достигнут лимит субаккаунтов. Ожидаем завершения платежей...');
      break;
    }

    const subUid = await createSubAccount(c.id);
    if (!subUid) continue;

    await new Promise(resolve => setTimeout(resolve, 5000)); // Задержка 5 секунд
    const address = await getSubDepositAddress(subUid);
    if (!address) {
      await deleteSubAccount(subUid);
      continue;
    }

    clientPayments[c.id] = { name: c.name, subUid, address, amount: fixedAmount, paid: false };
    activeSubAccounts++;
    console.log(`Клиент ${c.name} (ID: ${c.id}): Адрес: ${address}, Сумма: ${fixedAmount} USDT`);
  }

  // Проверяем депозиты, переводим средства и удаляем субаккаунты
  const checkInterval = setInterval(async () => {
    for (const clientId in clientPayments) {
      if (!clientPayments[clientId].paid) {
        const subUid = clientPayments[clientId].subUid;
        const isPaid = await checkSubAccountDeposit(subUid, fixedAmount);
        if (isPaid) {
          clientPayments[clientId].paid = true;
          console.log(`Оплата от ${clientPayments[clientId].name} (ID: ${clientId}) подтверждена!`);
          // Переводим средства перед удалением
          const transferred = await transferFunds(subUid, fixedAmount);
          if (transferred) {
            const deleted = await deleteSubAccount(subUid);
            if (deleted) {
              activeSubAccounts--;
              delete clientPayments[clientId].subUid;
            }
          }
        }
      }
    }

    if (Object.values(clientPayments).every((c) => c.paid)) {
      console.log('Все клиенты из текущей очереди оплатили!');
      clearInterval(checkInterval);
    }
  }, 30000);

  return clientPayments;
}

// Пример вызова
const clients = [
  { id: 'client1', name: 'Алексей' },
  { id: 'client2', name: 'Мария' },
  { id: 'client3', name: 'Иван' },
];
const fixedAmount = 10; // 10 USDT (минимальный депозит для USDT на Bybit)

processClientPayments(clients, fixedAmount);