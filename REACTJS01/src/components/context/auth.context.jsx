import { createContext, useState, useEffect } from 'react';
import { getAccountApi } from '../../util/api';
import { Spin } from 'antd';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        id: "",
        email: "",
        name: "",
        role: "Member",
        addresses: [],
        defaultAddress: null,
    },
    appLoading: true,
});

export const AuthWrapper = (props) => {

    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: {
            id: "",
            email: "",
            name: "",
            role: "Member",
            addresses: [],
            defaultAddress: null,
        }
    });

    const [appLoading, setAppLoading] = useState(true);

    useEffect(() => {
        const fetchAccount = async () => {
            setAppLoading(true);
            try {
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
                    });
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
                    });
                }
            } catch (err) {
                console.error("Global fetchAccount error:", err);
            }
            setAppLoading(false);
        };

        fetchAccount();
    }, []);

    return (
        <AuthContext.Provider value={{
            auth, setAuth, appLoading, setAppLoading
        }}>
            {appLoading === true ? (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <Spin size="large" />
                </div>
            ) : (
                props.children
            )}
        </AuthContext.Provider>
    );
};