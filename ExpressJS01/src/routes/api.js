const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { getHome } = require('../controllers/homeController');
const { getCategories } = require('../controllers/categoryController');
const { getPromotions } = require('../controllers/promotionController');
const { getPosts, getPostDetail } = require('../controllers/postController');
const { getProducts, getProductDetail } = require('../controllers/productController');
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
routerAPI.get("/account", delay, getAccount);
routerAPI.get("/catalog/home", getHome);
routerAPI.get("/catalog/categories", getCategories);
routerAPI.get("/catalog/promotions", getPromotions);
routerAPI.get("/catalog/posts", getPosts);
routerAPI.get("/catalog/posts/:slug", getPostDetail);
routerAPI.get("/catalog/products", getProducts);
routerAPI.get("/catalog/products/:slug", getProductDetail);

module.exports = routerAPI;