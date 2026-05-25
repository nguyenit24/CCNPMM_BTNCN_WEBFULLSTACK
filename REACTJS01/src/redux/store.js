import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './slices/orderSlice';
import staffReducer from './slices/staffSlice';

export const store = configureStore({
    reducer: {
        orders: orderReducer,
        staff: staffReducer,
    },
});
