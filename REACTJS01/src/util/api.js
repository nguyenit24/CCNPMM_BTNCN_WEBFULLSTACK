import axios from "./axios.customize";

const createUserApi = (name, email, password) => {

    const URL_API = "/v1/api/register";

    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
}

const requestRegisterOtpApi = (data = {}) => {

    const URL_API = "/v1/api/register/request-otp";

    return axios.post(URL_API, data)
}

const verifyRegisterOtpApi = (data = {}) => {

    const URL_API = "/v1/api/register/verify-otp";

    return axios.post(URL_API, data)
}

const requestForgotPasswordOtpApi = (data = {}) => {

    const URL_API = "/v1/api/forgot-password/request-otp";

    return axios.post(URL_API, data)
}

const resetPasswordWithOtpApi = (data = {}) => {

    const URL_API = "/v1/api/forgot-password/reset-password";

    return axios.post(URL_API, data)
}

const loginApi = (email, password) => {

    const URL_API = "/v1/api/login";

    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {

    const URL_API = "/v1/api/user";

    return axios.get(URL_API)
}

const getUserDetailApi = (id) => {

    const URL_API = `/v1/api/user/${id}`;

    return axios.get(URL_API)
}

const updateUserApi = (id, data = {}) => {

    const URL_API = `/v1/api/user/${id}`;

    return axios.put(URL_API, data)
}

const deleteUserApi = (id) => {

    const URL_API = `/v1/api/user/${id}`;

    return axios.delete(URL_API)
}

const getAccountApi = () => {

    const URL_API = "/v1/api/account";

    return axios.get(URL_API)
}

const getHomeApi = () => {

    const URL_API = "/v1/api/home";

    return axios.get(URL_API)
}

const getCategoriesApi = () => {

    const URL_API = "/v1/api/categories";

    return axios.get(URL_API)
}

const getCategoryDetailApi = (slug) => {

    const URL_API = `/v1/api/categories/${slug}`;

    return axios.get(URL_API)
}

const createCategoryApi = (data = {}) => {

    const URL_API = "/v1/api/categories";

    return axios.post(URL_API, data)
}

const updateCategoryApi = (slug, data = {}) => {

    const URL_API = `/v1/api/categories/${slug}`;

    return axios.put(URL_API, data)
}

const deleteCategoryApi = (slug) => {

    const URL_API = `/v1/api/categories/${slug}`;

    return axios.delete(URL_API)
}

const getPromotionsApi = (params = {}) => {

    const URL_API = "/v1/api/promotions";

    return axios.get(URL_API, { params })
}

const getPromotionDetailApi = (slug) => {

    const URL_API = `/v1/api/promotions/${slug}`;

    return axios.get(URL_API)
}

const createPromotionApi = (data = {}) => {

    const URL_API = "/v1/api/promotions";

    return axios.post(URL_API, data)
}

const updatePromotionApi = (slug, data = {}) => {

    const URL_API = `/v1/api/promotions/${slug}`;

    return axios.put(URL_API, data)
}

const deletePromotionApi = (slug) => {

    const URL_API = `/v1/api/promotions/${slug}`;

    return axios.delete(URL_API)
}

const getProductsApi = (params = {}) => {

    const URL_API = "/v1/api/products";

    return axios.get(URL_API, { params })
}

const getTopProductsApi = (params = {}) => {

    const URL_API = "/v1/api/products/top";

    return axios.get(URL_API, { params })
}

const createProductApi = (data = {}) => {

    const URL_API = "/v1/api/products";

    return axios.post(URL_API, data)
}

const updateProductApi = (slug, data = {}) => {

    const URL_API = `/v1/api/products/${slug}`;

    return axios.put(URL_API, data)
}

const deleteProductApi = (slug) => {

    const URL_API = `/v1/api/products/${slug}`;

    return axios.delete(URL_API)
}

const getProductDetailApi = (slug) => {

    const URL_API = `/v1/api/products/${slug}`;

    return axios.get(URL_API)
}

const getCartApi = () => {

    const URL_API = "/v1/api/cart";

    return axios.get(URL_API)
}

const addCartItemApi = (data = {}) => {

    const URL_API = "/v1/api/cart/items";

    return axios.post(URL_API, data)
}

const updateCartItemApi = (slug, data = {}) => {

    const URL_API = `/v1/api/cart/items/${slug}`;

    return axios.put(URL_API, data)
}

const removeCartItemApi = (slug) => {

    const URL_API = `/v1/api/cart/items/${slug}`;

    return axios.delete(URL_API)
}

const clearCartApi = () => {

    const URL_API = "/v1/api/cart";

    return axios.delete(URL_API)
}

const addAccountAddressApi = (data = {}) => {

    const URL_API = "/v1/api/account/addresses";

    return axios.post(URL_API, data)
}

const updateAccountAddressApi = (addressId, data = {}) => {

    const URL_API = `/v1/api/account/addresses/${addressId}`;

    return axios.put(URL_API, data)
}

const deleteAccountAddressApi = (addressId) => {

    const URL_API = `/v1/api/account/addresses/${addressId}`;

    return axios.delete(URL_API)
}

const getOrdersApi = () => {

    const URL_API = "/v1/api/orders";

    return axios.get(URL_API)
}

const getOrderDetailApi = (id) => {

    const URL_API = `/v1/api/orders/${id}`;

    return axios.get(URL_API)
}

const checkoutOrderApi = (data = {}) => {

    const URL_API = "/v1/api/orders/checkout";

    return axios.post(URL_API, data)
}

const cancelOrderApi = (id, data = {}) => {

    const URL_API = `/v1/api/orders/${id}/cancel`;

    return axios.post(URL_API, data)
}

const updateOrderStatusApi = (id, data = {}) => {

    const URL_API = `/v1/api/orders/${id}/status`;

    return axios.patch(URL_API, data)
}

const getPostDetailApi = (slug) => {

    const URL_API = `/v1/api/posts/${slug}`;

    return axios.get(URL_API)
}

const getPostsApi = (params = {}) => {

    const URL_API = "/v1/api/posts";

    return axios.get(URL_API, { params })
}

const createPostApi = (data = {}) => {

    const URL_API = "/v1/api/posts";

    return axios.post(URL_API, data)
}

const updatePostApi = (slug, data = {}) => {

    const URL_API = `/v1/api/posts/${slug}`;

    return axios.put(URL_API, data)
}

const deletePostApi = (slug) => {

    const URL_API = `/v1/api/posts/${slug}`;

    return axios.delete(URL_API)
}

const refreshTokenApi = (refreshToken) => {
    const URL_API = "/v1/api/auth/refresh";
    return axios.post(URL_API, { refreshToken });
}

const logoutApi = () => {
    const URL_API = "/v1/api/auth/logout";
    return axios.post(URL_API);
}

export {
    createUserApi,
    requestRegisterOtpApi,
    verifyRegisterOtpApi,
    requestForgotPasswordOtpApi,
    resetPasswordWithOtpApi,
    loginApi,
    getUserApi,
    getUserDetailApi,
    updateUserApi,
    deleteUserApi,
    getAccountApi,
    getHomeApi,
    getCategoriesApi,
    getCategoryDetailApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
    getPromotionsApi,
    getPromotionDetailApi,
    createPromotionApi,
    updatePromotionApi,
    deletePromotionApi,
    getProductsApi,
    getTopProductsApi,
    createProductApi,
    updateProductApi,
    deleteProductApi,
    getProductDetailApi,
    getCartApi,
    addCartItemApi,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
    addAccountAddressApi,
    updateAccountAddressApi,
    deleteAccountAddressApi,
    getOrdersApi,
    getOrderDetailApi,
    checkoutOrderApi,
    cancelOrderApi,
    updateOrderStatusApi,
    getPostsApi,
    getPostDetailApi,
    createPostApi,
    updatePostApi,
    deletePostApi,
    refreshTokenApi,
    logoutApi,
}