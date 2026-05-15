import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import './styles/store.css';

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
import ProductsPage from './pages/products.jsx';
import ProductDetailPage from './pages/product-detail.jsx';
import PostDetailPage from './pages/post-detail.jsx';
import PostsPage from './pages/posts.jsx';
import ProfilePage from './pages/profile.jsx';
import AdminPage from './pages/admin.jsx';

import { AuthWrapper } from './components/context/auth.context.jsx';
import { ProtectedRoute, RoleRoute } from './components/context/route-guard.jsx';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="posts/:slug" element={<PostDetailPage />} />
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
                    path="admin"
                    element={(
                        <RoleRoute roles={["Admin"]}>
                            <AdminPage />
                        </RoleRoute>
                    )}
                />
            </Route>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
        </>
    )
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>

        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>

    </React.StrictMode>,
)