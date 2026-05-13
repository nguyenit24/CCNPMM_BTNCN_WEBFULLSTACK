import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import './styles/store.css';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ProductsPage from './pages/products.jsx';
import ProductDetailPage from './pages/product-detail.jsx';
import PostDetailPage from './pages/post-detail.jsx';

import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "products",
                element: <ProductsPage />
            },
            {
                path: "products/:slug",
                element: <ProductDetailPage />
            },
            {
                path: "posts/:slug",
                element: <PostDetailPage />
            },
            {
                path: "user",
                element: <UserPage />
            },
        ]
    },

    {
        path: "register",
        element: <RegisterPage />
    },

    {
        path: "login",
        element: <LoginPage />
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>

        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>

    </React.StrictMode>,
)