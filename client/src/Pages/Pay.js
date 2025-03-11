import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import api from "../api";

export default function Pay() {
    const { chatId, period } = useParams()
    const [paymentMethod, setPaymentMethod] = useState("foreign_bank");
    const [email, setEmail] = useState("")
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [price, setPrice] = useState(null);

    const productId = "6a336c2b-7992-40d7-8829-67159d4cd3c5";

    useEffect(() => {
        const handleResize = () => {
            document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get("/getProducts");
                console.log("response in Pay = ", response);
                
                const products = response.data.items

                const product = products
                    .flatMap(p => p.offers)
                    .find(offer => offer.id === productId);

                if (!product) {
                    console.error("Продукт не найден");
                    return;
                }

                const periodicityMap = {
                    "1": "MONTHLY",
                    "3": "PERIOD_90_DAYS",
                    "12": "PERIOD_YEAR",
                };

                const selectedPeriod = periodicityMap[period] || "MONTHLY";
                const selectedCurrency = paymentMethod === "bank_rf" ? "RUB" : "USD";

                const selectedPrice = product.prices.find(
                    p => p.periodicity === selectedPeriod && p.currency === selectedCurrency
                );

                if (selectedPrice) {
                    setPrice(`${selectedPrice.amount} ${selectedPrice.currency}`);
                } else {
                    console.error("Цена не найдена");
                    setPrice("N/A");
                }
            } catch (error) {
                console.error("Ошибка при получении продукта:", error);
            }
        };

        fetchProduct();
    }, [period, paymentMethod]);

    const handleClick = async () => {
        setLoading(true);
        try {
            await api.post("/updateUser", { chatId, email, period }, {
                headers: { "Content-Type": "application/json" },
            });
    
            let periodicity = "";
            if (period === "1") periodicity = "MONTHLY";
            if (period === "3") periodicity = "PERIOD_90_DAYS";
            if (period === "12") periodicity = "PERIOD_YEAR";
            const currency = paymentMethod === "bank_rf" ? "RUB" : "USD";
    
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
    
                // Снимаем фокус перед переходом
                document.activeElement.blur();
    
                // Переход на страницу оплаты
                setTimeout(() => {
                    window.location.href = data.paymentUrl;
                }, 100);
            } else {
                console.error("Ошибка: data.id отсутствует", data);
            }
        } catch (error) {
            console.error("Ошибка при создании счета:", error);
        } finally {
            setTimeout(() => setLoading(false), 2000);
        }
    };
    

    return <div className="flex items-center justify-center min-h-screen bg-black text-white p-4"
    style={{ minHeight: "var(--app-height)" }} 
    >
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
                <p className="mb-4">Образовательное сообщество «YouTube для ВСЕХ» / {period} мес.</p>
                
                <h2 className="text-lg font-bold mb-4">Метод оплаты</h2>
                <div className="flex gap-2 mb-4">
                <button
                    className={`flex-1 p-3 rounded-lg ${paymentMethod === "foreign_bank" ? "bg-gray-700" : "bg-gray-800"}`}
                    onClick={() => setPaymentMethod("foreign_bank")}
                    >
                    Любой банк
                    </button>
                    <button
                    className={`flex-1 p-3 rounded-lg ${paymentMethod === "bank_rf" ? "bg-gray-700" : "bg-gray-800"}`}
                    onClick={() => setPaymentMethod("bank_rf")}
                    >
                    Банк РФ
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
                <p className="text-2xl font-bold mb-6">{price}</p>
                
                <button className="w-full p-3 bg-gray-800 rounded-lg text-white" onClick={() => {setStep(2)}}>Далее</button>
            </div> :
            <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg">
                <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg">
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Наименование товара</p>
                    <p className="text-white">Образовательное сообщество «YouTube для ВСЕХ» / {period} мес.</p>
                    </div>
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Метод оплаты</p>
                    <p className="text-white">{paymentMethod === "bank_rf" ? "Банк РФ" : "Любой банк"}</p>
                    </div>
                    <div className="mb-2">
                    <p className="text-gray-400 text-sm">Ваш E-mail</p>
                    <p className="text-white">{email}</p>
                    </div>
                    <div>
                    <p className="text-gray-400 text-sm">Стоимость</p>
                    <p className="text-white">{price}</p>
                    </div>
                </div>
                
                {/* Кнопки */}
                <div className="w-full max-w-md mt-6">
                    <button
                        className="w-full bg-white text-black font-semibold py-3 rounded-lg mb-3 flex items-center justify-center"
                        onClick={handleClick}
                        disabled={loading}
                    >
                        {loading ? "Загрузка..." : "Перейти к оплате"}
                    </button>
                    <button className="w-full text-white text-sm" onClick={() => {setStep(1)}}>Вернуться назад</button>
                </div>
            </div>
        }
    </div>
}