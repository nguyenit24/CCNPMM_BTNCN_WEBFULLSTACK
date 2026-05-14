const express = require('express');
const {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    getUserDetail,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { getHome } = require('../controllers/homeController');
const {
    getCategories,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const {
    getPromotions,
    getPromotionDetail,
    createPromotion,
    updatePromotion,
    deletePromotion,
} = require('../controllers/promotionController');
const {
    getPosts,
    getPostDetail,
    createPost,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/user", getUser);
routerAPI.get("/user/:id", getUserDetail);
routerAPI.put("/user/:id", updateUser);
routerAPI.delete("/user/:id", deleteUser);
routerAPI.get("/account", delay, getAccount);
routerAPI.get("/catalog/home", getHome);
routerAPI.get("/catalog/categories", getCategories);
routerAPI.get("/catalog/categories/:slug", getCategoryDetail);
routerAPI.post("/catalog/categories", createCategory);
routerAPI.put("/catalog/categories/:slug", updateCategory);
routerAPI.delete("/catalog/categories/:slug", deleteCategory);
routerAPI.get("/catalog/promotions", getPromotions);
routerAPI.get("/catalog/promotions/:slug", getPromotionDetail);
routerAPI.post("/catalog/promotions", createPromotion);
routerAPI.put("/catalog/promotions/:slug", updatePromotion);
routerAPI.delete("/catalog/promotions/:slug", deletePromotion);
routerAPI.get("/catalog/posts", getPosts);
routerAPI.get("/catalog/posts/:slug", getPostDetail);
routerAPI.post("/catalog/posts", createPost);
routerAPI.put("/catalog/posts/:slug", updatePost);
routerAPI.delete("/catalog/posts/:slug", deletePost);
routerAPI.get("/catalog/products", getProducts);
routerAPI.get("/catalog/products/:slug", getProductDetail);
routerAPI.post("/catalog/products", createProduct);
routerAPI.put("/catalog/products/:slug", updateProduct);
routerAPI.delete("/catalog/products/:slug", deleteProduct);

module.exports = routerAPI;