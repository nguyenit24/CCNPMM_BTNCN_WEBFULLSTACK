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
const {
    requestRegisterOtp,
    verifyRegisterOtp,
    requestForgotPasswordOtp,
    resetPasswordWithOtp,
} = require('../controllers/authOtpController');
const { sendTestEmail } = require('../controllers/debugController');
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
    getTopProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/register/request-otp", requestRegisterOtp);
routerAPI.post("/register/verify-otp", verifyRegisterOtp);
routerAPI.post("/forgot-password/request-otp", requestForgotPasswordOtp);
routerAPI.post("/forgot-password/reset-password", resetPasswordWithOtp);
routerAPI.post('/debug/send-test-email', sendTestEmail);

routerAPI.get("/home", getHome);

routerAPI.get("/categories", getCategories);
routerAPI.get("/categories/:slug", getCategoryDetail);

routerAPI.get("/promotions", getPromotions);
routerAPI.get("/promotions/:slug", getPromotionDetail);

routerAPI.get("/posts", getPosts);
routerAPI.get("/posts/:slug", getPostDetail);

routerAPI.get("/products", getProducts);
routerAPI.get("/products/top", getTopProducts);
routerAPI.get("/products/:slug", getProductDetail);

routerAPI.use(authenticate);

routerAPI.get("/account", delay, getAccount);

routerAPI.get("/user", authorizeRoles('Admin'), getUser);
routerAPI.get("/user/:id", authorizeRoles('Admin'), getUserDetail);
routerAPI.put("/user/:id", authorizeRoles('Admin'), updateUser);
routerAPI.delete("/user/:id", authorizeRoles('Admin'), deleteUser);

routerAPI.post("/categories", authorizeRoles('Admin'), createCategory);
routerAPI.put("/categories/:slug", authorizeRoles('Admin'), updateCategory);
routerAPI.delete("/categories/:slug", authorizeRoles('Admin'), deleteCategory);

routerAPI.post("/promotions", authorizeRoles('Admin'), createPromotion);
routerAPI.put("/promotions/:slug", authorizeRoles('Admin'), updatePromotion);
routerAPI.delete("/promotions/:slug", authorizeRoles('Admin'), deletePromotion);

routerAPI.post("/posts", authorizeRoles('Admin'), createPost);
routerAPI.put("/posts/:slug", authorizeRoles('Admin'), updatePost);
routerAPI.delete("/posts/:slug", authorizeRoles('Admin'), deletePost);

routerAPI.post("/products", authorizeRoles('Admin'), createProduct);
routerAPI.put("/products/:slug", authorizeRoles('Admin'), updateProduct);
routerAPI.delete("/products/:slug", authorizeRoles('Admin'), deleteProduct);

module.exports = routerAPI;