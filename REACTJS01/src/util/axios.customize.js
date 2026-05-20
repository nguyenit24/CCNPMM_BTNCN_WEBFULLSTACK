import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(function (config) {

    // Do something before request is sent
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (config.headers?.Authorization) {
        delete config.headers.Authorization;
    }

    return config;

}, function (error) {

    // Do something with request error
    return Promise.reject(error);
});


// Add a response interceptor
instance.interceptors.response.use(function (response) {

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    if (response && response.data) {
        const body = response.data;
        if (body && typeof body === 'object') {
            // Nếu là định dạng DTO { success, message, data } từ backend DTO middleware
            if ('success' in body && 'message' in body && 'data' in body) {
                if (body.success === true) {
                    // Trả về trực tiếp trường data bên trong khi API thành công.
                    // Việc này giúp xóa bỏ trường 'message' ("Thành công") khỏi đối tượng kết quả,
                    // giúp toàn bộ giao diện React không bị nhận diện nhầm là có lỗi xảy ra (do React kiểm tra res.message).
                    return body.data !== undefined ? body.data : body;
                } else {
                    // API thất bại (success = false)
                    return {
                        success: false,
                        EC: body.EC !== undefined ? body.EC : 1,
                        EM: body.message || 'Đã xảy ra lỗi',
                        message: body.message || 'Đã xảy ra lỗi',
                        data: body.data
                    };
                }
            }
        }
        return response.data;
    }

    return response;

}, async function (error) {

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (chưa xác thực/hết hạn access token) và chưa từng thử lại
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
            try {
                // Gọi API Refresh Token bằng axios thuần để tránh vòng lặp interceptor
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/api/auth/refresh`, {
                    refreshToken
                });

                // Dữ liệu từ middleware bọc DTO sẽ có dạng res.data.data hoặc res.data trực tiếp do đã được unwrap ở trên
                const responseData = res?.data?.data || res?.data;
                const newAccessToken = responseData?.access_token;
                const newRefreshToken = responseData?.refresh_token;

                if (newAccessToken) {
                    localStorage.setItem("access_token", newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem("refresh_token", newRefreshToken);
                    }

                    // Cập nhật lại header Authorization của request gốc và chạy lại request đó
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                console.log(">>> Lỗi khi tự động refresh token:", refreshError);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
            }
        }
    }

    if (error?.response?.data) {
        const body = error.response.data;
        if (body && typeof body === 'object') {
            if ('success' in body && 'message' in body) {
                return {
                    success: false,
                    EC: body.EC !== undefined ? body.EC : 1,
                    EM: body.message || 'Đã xảy ra lỗi',
                    message: body.message || 'Đã xảy ra lỗi',
                    data: body.data
                };
            }
        }
        return body;
    }

    return Promise.reject(error);
});

export default instance;