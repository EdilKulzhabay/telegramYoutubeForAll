import { useEffect, useState } from "react";
import api from "../api";

function Auth({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const response = await api.post("/auth", { email, password });
    
            if (response.data.success) {
                localStorage.setItem("token", response.data.token); // Храните токен вместо пароля
                onLogin();
            } else {
                setError("Ошибка авторизации");
            }
        } catch (err) {
            setError("Ошибка сервера");
        }
    };
    

    return (
        <div className="px-5 py-10 flex flex-col items-center">
            <h1 className="text-2xl font-medium">Авторизация</h1>
            <input 
                className="border p-2 mt-4" 
                type="text" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                className="border p-2 mt-2" 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button 
                className="px-4 py-2 bg-blue-700 text-white mt-4 hover:bg-blue-500"
                onClick={handleLogin}
            >Войти</button>
        </div>
    );
}

function HistoryData() {
    const [email, setEmail] = useState("");
    const [hash, setHash] = useState("");
    const [histories, setHistories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const getHistories = async (newPage) => {
        await api.post("/getHistories", { email, hash, page: newPage }, {
            headers: { "Content-Type": "application/json" },
        }).then(({ data }) => {
            setHistories(data.histories);
            setTotalPages(data.totalPages || 1);
            setPage(newPage);
        });
    };

    useEffect(() => {
        getHistories(page);
    }, []);

    return (
        <div className="px-5 py-10">
            <div className="text-xl font-medium">История</div>
            <div className="mt-5 flex items-center gap-2">
                <div className="text-lg">Поиск по почте Lava: </div>
                <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-1"
                />
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={() => getHistories(1)}    
                >Поиск</button>
            </div>
            <div className="mt-5 flex items-center gap-2">
                <div className="text-lg">Поиск по Hash: </div>
                <input 
                    value={hash} 
                    onChange={(e) => setHash(e.target.value)}
                    className="border p-1"
                />
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={() => getHistories(1)}    
                >Поиск</button>
            </div>
            <div className="mt-4">
                {histories && histories.length > 0 ? (
                    histories.map((item) => (
                        <div className="mt-4 border p-3 rounded-md" key={item.timestamp}>
                            <div>{item.eventType === "bybit" ? "Bybit" : "Lava"}</div>
                            <div className="mt-2">{item.eventType === "bybit" ? item.rawData.txID : item.rawData.buyer.email}</div>
                            <div className="mt-2">
                                {item.eventType === "bybit" 
                                    ? <span>{item.rawData.amount} USDT</span> 
                                    : <span>{item.rawData.amount} {item.rawData.currency}</span>}
                            </div>
                            {item.eventType !== "bybit" && <div className="mt-2">{item.rawData.eventType}: {item.rawData.errorMessage}</div>}
                            <div className="mt-2">
                                {new Date(new Date(item.timestamp).getTime() + 5 * 60 * 60 * 1000).toLocaleString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="mt-4 text-gray-500">Нет данных</div>
                )}
            </div>
            
            {/* Пагинация */}
            <div className="mt-5 flex justify-center items-center gap-2">
                <button
                    className={`px-3 py-1 border rounded-md ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => page > 1 && getHistories(page - 1)}
                    disabled={page === 1}
                >
                    ← Назад
                </button>
                <span>Страница {page} из {totalPages}</span>
                <button
                    className={`px-3 py-1 border rounded-md ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => page < totalPages && getHistories(page + 1)}
                    disabled={page === totalPages}
                >
                    Вперед →
                </button>
            </div>
        </div>
    );
}

export default function History() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
    
        if (storedToken) {
            api.post("/verifyToken", { token: storedToken })
                .then(response => {
                    if (response.data.valid) setIsAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                });
        }
    }, []);

    return isAuthenticated ? <HistoryData /> : <Auth onLogin={() => setIsAuthenticated(true)} />;
}
