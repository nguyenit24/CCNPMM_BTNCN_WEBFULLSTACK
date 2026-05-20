import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";

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
                        id: res.id ?? "",
                        email: res.email,
                        name: res.name,
                        role: res.role || "Member"
                    }
                })
            } else {
                setAuth({
                    isAuthenticated: false,
                    user: {
                        id: "",
                        email: "",
                        name: "",
                        role: "Member"
                    }
                })
            }

            setAppLoading(false);
        }

        fetchAccount();

    }, [setAuth, setAppLoading])

    return (
        <div>

            {appLoading === true ?

                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>

                    <Spin />

                </div>

                :

                <>
                        {isAdminRoute ? null : <Header />}
                    <Outlet />
                </>
            }

        </div>
    )
}

export default App