import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi, updateOrderStatusApi } from '../../util/api';

// Async thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getOrdersApi();
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return Array.isArray(res) ? res : [];
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể tải danh sách đơn hàng');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ id, status, note }, { rejectWithValue }) => {
        try {
            const res = await updateOrderStatusApi(id, { status, note });
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return res; // returns the serialized updated order
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrdersError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Order Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const index = state.items.findIndex(item => item._id === updated._id || item.id === updated.id);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrdersError } = orderSlice.actions;
export default orderSlice.reducer;
