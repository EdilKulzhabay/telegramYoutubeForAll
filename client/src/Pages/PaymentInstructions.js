import React from "react";

// регистрация
import image1 from "../assets/images/image1.jpg";
import image5 from "../assets/images/image5.jpg";
import image6 from "../assets/images/image6.jpg";
import image7 from "../assets/images/image7.jpg";
import image8 from "../assets/images/image8.jpg";
import image9 from "../assets/images/image9.jpg";
import image10 from "../assets/images/image10.jpg";
import image11 from "../assets/images/image11.jpg";
import image12 from "../assets/images/image12.jpg";
import image13 from "../assets/images/image13.jpg";

// оплата
import image2 from "../assets/images/image2.jpg";
import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";


const PaymentInstructions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Инструкция по оплате</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 1: Открытие приложения</h2>
          <img src={image1} alt="Шаг 1" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 2: Переход на личный кабинет</h2>
          <img src={image5} alt="Шаг 5" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 3: Переход на регистрацию</h2>
          <img src={image6} alt="Шаг 6" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 4: Введите почту и подтвердите</h2>
          <img src={image7} alt="Шаг 7" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 5: Потдвердите почту с помощью кода</h2>
          <img src={image8} alt="Шаг 8" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 6: Придумайте и потдвердите пароль</h2>
          <img src={image9} alt="Шаг 9" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 7: Перейдите на подтверждение личности</h2>
          <img src={image10} alt="Шаг 10" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 8: Выберите свой регион и подтвердите</h2>
          <img src={image11} alt="Шаг 11" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 9: Перейдите на потдверждение по удостоверению личности</h2>
          <img src={image12} alt="Шаг 12" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 10: Выберите регион и выберите типа документа</h2>
          <img src={image13} alt="Шаг 13" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 11: Выбор метода оплаты</h2>
          <img src={image2} alt="Шаг 2" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 12: Подтверждение платежа</h2>
          <img src={image3} alt="Шаг 3" className="w-full rounded-lg shadow-md" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Шаг 13: Завершение</h2>
          <img src={image4} alt="Шаг 4" className="w-full rounded-lg shadow-md" />
        </div>

      </div>
    </div>
  );
};

export default PaymentInstructions;
