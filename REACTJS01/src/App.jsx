import { Outlet, Navigate } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

import { useContext } from "react";
import { AuthContext } from "./components/context/auth.context";

function App() {

    const { auth } = useContext(AuthContext);

    // Redirect Admin if trying to access storefront pages under /
    if (auth?.isAuthenticated && String(auth?.user?.role || '').toLowerCase() === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="app-root">
            <Header />
            <main className="app-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default App;