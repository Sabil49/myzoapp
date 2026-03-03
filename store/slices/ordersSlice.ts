// store/slices/ordersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setOrders, addOrder, setSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
