import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/store.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";

import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/forgot-password.jsx';
import ProductsPage from './pages/products.jsx';
import ProductDetailPage from './pages/product-detail.jsx';
import CartPage from './pages/cart.jsx';
import CheckoutPage from './pages/checkout.jsx';
import PostDetailPage from './pages/post-detail.jsx';
import PostsPage from './pages/posts.jsx';
import OrdersPage from './pages/orders.jsx';
import ProfilePage from './pages/profile.jsx';
import AdminPage from './pages/admin.jsx';
import StaffPage from './pages/staff.jsx';
import FavoritesPage from './pages/favorites.jsx';
import RewardsPage from './pages/rewards.jsx';

import { AuthWrapper } from './components/context/auth.context.jsx';
import { ProtectedRoute, RoleRoute } from './components/context/route-guard.jsx';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route
                    path="cart"
                    element={(
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="checkout"
                    element={(
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    )}
                />
                <Route path="posts" element={<PostsPage />} />
                <Route path="posts/:slug" element={<PostDetailPage />} />
                <Route
                    path="orders"
                    element={(
                        <ProtectedRoute>
                            <OrdersPage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="user"
                    element={(
                        <RoleRoute roles={["Admin"]}>
                            <UserPage />
                        </RoleRoute>
                    )}
                />
                <Route
                    path="profile"
                    element={(
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="favorites"
                    element={(
                        <ProtectedRoute>
                            <FavoritesPage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="rewards"
                    element={(
                        <ProtectedRoute>
                            <RewardsPage />
                        </ProtectedRoute>
                    )}
                />

            </Route>
            <Route
                path="/admin"
                element={(
                    <RoleRoute roles={["Admin"]}>
                        <AdminPage />
                    </RoleRoute>
                )}
            />
            <Route
                path="/staff"
                element={(
                    <RoleRoute roles={["Staff"]}>
                        <StaffPage />
                    </RoleRoute>
                )}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </>
    )
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <AuthWrapper>
                <RouterProvider router={router} />
            </AuthWrapper>
        </Provider>
    </React.StrictMode>,
)