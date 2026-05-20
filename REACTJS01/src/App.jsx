import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";
import { getAccountApi } from "./util/api";
import { useLocation } from "react-router-dom";

function App() {

    const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {

        const fetchAccount = async () => {

            setAppLoading(true);

            const res = await getAccountApi();

            if (res && !res.message) {

                setAuth({
                    isAuthenticated: true,
                    user: {
                        id: res.id ?? res._id ?? "",
                        email: res.email,
                        name: res.name,
                        role: res.role || "Member",
                        addresses: Array.isArray(res.addresses) ? res.addresses : [],
                        defaultAddress: res.defaultAddress || null,
                    }
                })
            } else {
                setAuth({
                    isAuthenticated: false,
                    user: {
                        id: "",
                        email: "",
                        name: "",
                        role: "Member",
                        addresses: [],
                        defaultAddress: null,
                    }
                })
            }

            setAppLoading(false);
        }

        fetchAccount();

    }, [setAuth, setAppLoading])

    return (
        <div className="app-root">

            {appLoading === true ?

                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>

                    <Spin size="large" />

                </div>

                :

                <>
                    {isAdminRoute ? null : <Header />}
                    <main className="app-main">
                        <Outlet />
                    </main>
                    {isAdminRoute ? null : <Footer />}
                </>
            }

        </div>
    )
}

export default App