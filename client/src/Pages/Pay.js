import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import api from "../api";

export default function Pay() {
    const { chatId, period } = useParams()
    const [paymentMethod, setPaymentMethod] = useState("bank_rf");
    const [email, setEmail] = useState("")
    const navigate = useNavigate();

    const [step, setStep] = useState(1)

    const handleClick = async () => {
        await api.post("/updateUser", { chatId, email }, {
            headers: { "Content-Type": "application/json" },
        });
    
        const periodicity = period === 1 ? "MONTHLY" : period === 3 ? "PERIOD_90_DAYS" : "PERIOD_YEAR";
        const currency = paymentMethod === "bank_rf" ? "RUB" : "USD";
    
        try {
            const response = await api.post('/create-invoice', {
                email,
                periodicity,
                currency,
            }, {
                headers: { "Content-Type": "application/json" },
            });
            
            const data = response.data; 
    
            if (data && data.id) {
                const invoiceId = data.id;
    
                await api.post("/updateUserInvoiceId", { chatId, invoiceId }, {
                    headers: { "Content-Type": "application/json" },
                });
    
                navigate(data.paymentUrl);
            } else {
                console.error("Ошибка: data.id отсутствует", data);
            }
        } catch (error) {
            console.error("Ошибка при создании счета:", error);
        }
    };
    

    return <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
        {step === 1 ? 
            <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg">
                {/* <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black">✔</span>
                        <span>Выбор</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">⬤</span>
                        <span>Данные</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">⬤</span>
                        <span>Оплата</span>
                    </div>
                </div> */}
            
                <h2 className="text-lg font-bold mb-4">Наименование товара</h2>
                <p className="mb-4">YouTube для ВСЕХ / {period} мес.</p>
                
                <h2 className="text-lg font-bold mb-4">Метод оплаты</h2>
                <div className="flex gap-2 mb-4">
                    <button
                    className={`flex-1 p-3 rounded-lg ${paymentMethod === "bank_rf" ? "bg-gray-700" : "bg-gray-800"}`}
                    onClick={() => setPaymentMethod("bank_rf")}
                    >
                    Банк РФ
                    </button>
                    <button
                    className={`flex-1 p-3 rounded-lg ${paymentMethod === "foreign_bank" ? "bg-gray-700" : "bg-gray-800"}`}
                    onClick={() => setPaymentMethod("foreign_bank")}
                    >
                    Иностранный банк
                    </button>
                </div>
            
                <h2 className="text-lg font-bold mb-2">Ваш E-mail</h2>
                <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-500 mb-4"
                    onChange={(e) => {setEmail(e.target.value)}}
                />
                
                <h2 className="text-lg font-bold mb-2">Стоимость</h2>
                <p className="text-2xl font-bold mb-6">89.6 USD</p>
                
                <button className="w-full p-3 bg-gray-800 rounded-lg text-white" onClick={() => {setStep(2)}}>Далее</button>
            </div> :
            <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg">
                <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg">
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Наименование товара</p>
                    <p className="text-white">YouTube для ВСЕХ / {period} мес.</p>
                    </div>
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Метод оплаты</p>
                    <p className="text-white">{paymentMethod === "bank_rf" ? "Банк РФ" : "Иностранный банк"}</p>
                    </div>
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Ваш E-mail</p>
                    <p className="text-white">{email}</p>
                    </div>
                    <div>
                    <p className="text-gray-400 text-sm">Стоимость</p>
                    <p className="text-white">89.6 USD</p>
                    </div>
                </div>
                
                {/* Кнопки */}
                <div className="w-full max-w-md mt-6">
                    <button className="w-full bg-white text-black font-semibold py-3 rounded-lg mb-3" onClick={handleClick}>
                    Перейти к оплате
                    </button>
                    <button className="w-full text-white text-sm" onClick={() => {setStep(1)}}>Вернуться назад</button>
                </div>
            </div>
        }
    </div>
}