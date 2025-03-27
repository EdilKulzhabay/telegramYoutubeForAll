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

function BroadcastData() {
    const [userName, setUserName] = useState("");
    const [status, setStatus] = useState("all");
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [openText, setOpenText] = useState(false)
    const [message, setMessage] = useState("")

    const searchUser = async() => {
        await api.post("/searchUser", { userName }, {
            headers: { "Content-Type": "application/json" },
        }).then(({ data }) => {
            setUsers(data.users);
        });
    }

    const getUsers = async () => {
        await api.post("/getUsers", { status }, {
            headers: { "Content-Type": "application/json" },
        }).then(({ data }) => {
            setUsers(data.users);
            setTotalUsers(data.users.length)
        });
    };

    const broadcast = async () => {
        await api.post("/broadcast", { status, message }, {
            headers: { "Content-Type": "application/json" },
        })

        setOpenText(false)
        setMessage("")
    }

    useEffect(() => {
        getUsers();
    }, [status]);


    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        setUserName(""); // Сбрасываем поиск при смене статуса
    };

    const handleSearch = (event) => {
        setUserName(event.target.value)
        if (event.target.value === "") {
            getUsers()
        }
    }

    return (
        <div className="p-5">
            <div className="text-lg font-medium">Список пользователей по статусу: {status === "all" ? "Все" : status === "subscriptions" ? "Активные" : "Неактивные"}</div>
            <div className="mt-3 flex items-center gap-x-4">
                <div className="text-lg font-medium">Всего {totalUsers}</div>
                <div>
                    <button 
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                        onClick={() => {setOpenText(true)}}
                    >Начать рассылку</button>
                </div>
            </div>

            {openText && <div className="mt-3 flex items-center gap-x-3">
                <div>
                    <textarea value={message} onChange={(e) => {setMessage(e.target.value)}} />
                </div>
                
                <div>
                    <button 
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                        onClick={broadcast}
                    >Отправить</button>
                </div>
            </div>}
            
            <div className="mt-5 flex items-center gap-x-5">
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={() => handleStatusChange("all")}
                >
                    Все
                </button>
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={() => handleStatusChange("subscriptions")}
                >
                    Активные
                </button>
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={() => handleStatusChange("unsubscriptions")}
                >
                    Неактивные
                </button>
            </div>

            <div className="mt-5 flex items-center gap-2">
                <div className="text-lg">Поиск по имени пользователя: </div>
                <input 
                    value={userName} 
                    onChange={(e) => {handleSearch(e)}}
                    className="border p-1"
                />
                <button 
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-500 active:bg-blue-900 text-white"
                    onClick={searchUser}    
                >Поиск</button>
            </div>

            <div className="mt-2">
                {users && users.length > 0 && users.map((item) => {
                    return <div key={item?._id} className="mt-2">
                        {item?.userName} {item?.firstName}
                    </div>
                })}
            </div>

        </div>
    );
}

export default function Broadcast() {
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

    return isAuthenticated ? <BroadcastData /> : <Auth onLogin={() => setIsAuthenticated(true)} />;
}
