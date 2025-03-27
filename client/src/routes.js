import { createBrowserRouter } from "react-router-dom";
import Pay from "./Pages/Pay";
import History from "./Pages/History";
import PaymentInstructions from "./Pages/PaymentInstructions";
import Broadcast from "./Pages/Broadcast";

export const router = createBrowserRouter([
    { path: "/pay/:chatId/:period", element: <Pay />},
    { path: "/history", element: <History />},
    { path: "/paymentInstructions", element: <PaymentInstructions />},
    { path: "/broadcast", element: <Broadcast />},
]);
