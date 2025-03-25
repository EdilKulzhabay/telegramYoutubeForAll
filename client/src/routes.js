import { createBrowserRouter } from "react-router-dom";
import Pay from "./Pages/Pay";
import History from "./Pages/History";
import PaymentInstructions from "./Pages/PaymentInstructions";

export const router = createBrowserRouter([
    { path: "/pay/:chatId/:period", element: <Pay />},
    { path: "/history", element: <History />},
    { path: "/paymentInstructions", element: <PaymentInstructions />},
]);
