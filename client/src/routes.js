import { createBrowserRouter } from "react-router-dom";
import Pay from "./Pages/Pay";

export const router = createBrowserRouter([
    { path: "/pay/:chatId/:period", element: <Pay />},
]);
