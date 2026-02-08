import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/features/authSlice.js";
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import CreateOrder from "./pages/CreateOrder.jsx";
import OrdersList from "./pages/OrdersList.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";

function App() {
  const dispatch = useDispatch();
  const { user, checked } = useSelector((state) => state.auth);
  const isAuthenticated = !!user && checked;

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <LandingPage />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/orders" element={<OrdersList />} />
      <Route path="/orders/create" element={<CreateOrder />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
    </Routes>
  );
}

export default App;
