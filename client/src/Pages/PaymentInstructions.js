import React from "react";
import image0 from "../assets/images/image0.jpg";
import image1 from "../assets/images/image1.jpg";
import image2 from "../assets/images/image2.jpg";
import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";
import image5 from "../assets/images/image5.jpg";
import image6 from "../assets/images/image6.jpg";
import image7 from "../assets/images/image7.jpg";
import image8 from "../assets/images/image8.jpg";
import image9 from "../assets/images/image9.jpg";
import image10 from "../assets/images/image10.jpg";
import image11 from "../assets/images/image11.jpg";
import image12 from "../assets/images/image12.jpg";
import image13 from "../assets/images/image13.jpg";
import image14 from "../assets/images/image14.jpg";
import image15 from "../assets/images/image15.jpg";


const PaymentInstructions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Инструкция по оплате</h1>

      <div className="my-4">
        <div className="font-semibold text-red-700">Важно!!!</div>
        <div className="font-semibold">Учитывайте комиссию при оплате, сумма оплаты не должна быть меньше указанной суммы.</div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 1: Перйдите в меню бота по ссылке <a href="t.me/CryptoBot" className="text-blue-700 hover:text-blue-500">CryptoBot</a></h2>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 2: После старта нажмите на кнопку P2P</h2>
          <img src={image0} alt="Шаг 2" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 3: После нажмите на кнопку Купить</h2>
          <img src={image1} alt="Шаг 3" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 4: Найдите и выберите Tether (USDT)</h2>
          <img src={image2} alt="Шаг 4" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 5: Выберите удобный для вас способ оплаты</h2>
          <img src={image3} alt="Шаг 5" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 6: Выбираем подходящее объявление</h2>
          <img src={image4} alt="Шаг 6" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 7: Нажимаем Купить USDT</h2>
          <img src={image5} alt="Шаг 7" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 8: Еще раз нажимаем Купить</h2>
          <img src={image6} alt="Шаг 8" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 9: Указываем сумму либо в KZT либо в USDT</h2>
          <img src={image7} alt="Шаг 9" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 10: После создаем сделку</h2>
          <img src={image8} alt="Шаг 10" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 11: После того как продавце принял сделку, открываем сделку</h2>
          <img src={image10} alt="Шаг 11" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 12: Отправляем на указанные реквизиты и подтверждаем платеж отправкой чека</h2>
          <img src={image11} alt="Шаг 12" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">После подтверждение нужно будет подождать около часа для того что бы USDT поступили на ваш кошелёк</h2>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 13: Как придет подтверждение что USDT поступили, нужно будет заново прописать /start и нажать на кошелек</h2>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 14: Нажимаем вывести</h2>
          <img src={image12} alt="Шаг 13" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 15: Выбираем USDT</h2>
          <img src={image13} alt="Шаг 15" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 16: Обязательно нужно выбрать Tron TRC20</h2>
          <img src={image14} alt="Шаг 16" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 17: Вводим адрес кошелка который указал наш бот и вводим сумму</h2>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 18: После вам придет подтверждение сделки, вы должны пройти и скопировать hash и отправить нашему боту </h2>
          <img src={image15} alt="Шаг 18" className="w-full rounded-lg shadow-md" />
        </div>

      </div>
    </div>
  );
};

export default PaymentInstructions;
