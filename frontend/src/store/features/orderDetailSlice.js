import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../utils/axiosClient.js";

export const fetchOrderDetail = createAsyncThunk(
  "orderDetail/fetch",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/order/details/${orderId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || err.message,
        status: err.response?.status,
      });
    }
  }
);

const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState: {
    order: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderDetail: (state) => {
      state.order = null;
      state.error = null;
    },
    clearOrderDetailError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.order = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.order = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderDetail, clearOrderDetailError } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
