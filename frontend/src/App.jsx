import { Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import AsmaraDashboard from "./pages/AsmaraDashboard.jsx";
import FactoryDashboard from "./pages/FactoryDashboard.jsx";
import CreateOrder from "./pages/CreateOrder.jsx";
import OrdersList from "./pages/OrdersList.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/asmara" element={<AsmaraDashboard />} />
      <Route path="/factory" element={<FactoryDashboard />} />
      <Route path="/orders" element={<OrdersList />} />
      <Route path="/orders/create" element={<CreateOrder />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
    </Routes>
  );
}

export default App;
