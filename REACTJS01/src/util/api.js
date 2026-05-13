import axios from "./axios.customize";

const createUserApi = (name, email, password) => {

    const URL_API = "/v1/api/register";

    const data = {
        name, email, password
    }

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

const getAccountApi = () => {

    const URL_API = "/v1/api/account";

    return axios.get(URL_API)
}

const getHomeApi = () => {

    const URL_API = "/v1/api/catalog/home";

    return axios.get(URL_API)
}

const getProductsApi = (params = {}) => {

    const URL_API = "/v1/api/catalog/products";

    return axios.get(URL_API, { params })
}

const getProductDetailApi = (slug) => {

    const URL_API = `/v1/api/catalog/products/${slug}`;

    return axios.get(URL_API)
}

const getPostDetailApi = (slug) => {

    const URL_API = `/v1/api/catalog/posts/${slug}`;

    return axios.get(URL_API)
}

export {
    createUserApi,
    loginApi,
    getUserApi,
    getAccountApi,
    getHomeApi,
    getProductsApi,
    getProductDetailApi,
    getPostDetailApi,
}