import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";

import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";
import { getAccountApi } from "./util/api";

function App() {

    const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        const fetchAccount = async () => {

            setAppLoading(true);

            const res = await getAccountApi();

            if (res && !res.message) {

                setAuth({
                    isAuthenticated: true,
                    user: {
                        email: res.email,
                        name: res.name,
                        role: res.role || "Member"
                    }
                })
            } else {
                setAuth({
                    isAuthenticated: false,
                    user: {
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

    useEffect(() => {
        if (!appLoading && !auth.isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login');
        }
    }, [appLoading, auth.isAuthenticated, location.pathname, navigate])

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
                    <Header />
                    <Outlet />
                </>
            }

        </div>
    )
}

export default App