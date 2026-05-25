import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserApi, createAdminUserApi, updateUserApi, deleteUserApi } from '../../util/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
    'staff/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getUserApi();
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return Array.isArray(res) ? res : [];
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể tải danh sách tài khoản');
        }
    }
);

export const createUser = createAsyncThunk(
    'staff/createUser',
    async ({ name, email, password, role }, { rejectWithValue }) => {
        try {
            const res = await createAdminUserApi(name, email, password, role);
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return res;
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể tạo tài khoản mới');
        }
    }
);

export const updateUser = createAsyncThunk(
    'staff/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await updateUserApi(id, data);
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return res;
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể cập nhật tài khoản');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'staff/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            const res = await deleteUserApi(id);
            if (res && res.message) {
                return rejectWithValue(res.message);
            }
            return id; // Return the deleted user's id
        } catch (error) {
            return rejectWithValue(error.message || 'Không thể xóa tài khoản');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        clearStaffError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create User
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const index = state.items.findIndex(item => item._id === updated._id || item.id === updated.id);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload;
                state.items = state.items.filter(item => item._id !== deletedId && item.id !== deletedId);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
