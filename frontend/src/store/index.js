import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice.js";
import ordersReducer from "./features/ordersSlice.js";
import orderDetailReducer from "./features/orderDetailSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer,
  },
});
