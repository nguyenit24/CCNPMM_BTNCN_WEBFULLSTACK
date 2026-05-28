const express = require('express');
const {
    createUser,
    createAdminUser,
    handleLogin,
    getUser,
    getAccount,
    addAccountAddress,
    updateAccountAddress,
    deleteAccountAddress,
    getUserDetail,
    updateUser,
    updateAccountProfile,
    deleteUser,
    handleRefreshToken,
    handleLogout,
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
const {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');
const {
    getOrders,
    getOrderDetail,
    checkoutOrder,
    cancelOrder,
    updateOrderStatus,
} = require('../controllers/orderController');
const {
    createReview,
    getProductReviews,
    getMyRewards,
    updateReview,
    deleteReview,
    getMyReviews,
} = require('../controllers/reviewController');
const { redeemVoucher, getMyVouchers, validateVoucher, getVoucherOptions } = require('../controllers/voucherController');
const { calculateShipping } = require('../services/shippingService');
const {
    addFavorite,
    removeFavorite,
    getMyFavorites,
} = require('../controllers/favoriteController');
const {
    addViewHistory,
    getMyViewHistory,
} = require('../controllers/viewHistoryController');
const { getProductStatistics } = require('../controllers/statisticsController');
const { upload, uploadImage } = require('../controllers/uploadController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const delay = require('../middleware/delay');
const validateWithDto = require('../middleware/validateMiddleware');
const LoginDto = require('../dtos/loginDto');
const RegisterDto = require('../dtos/registerDto');
const CategoryDto = require('../dtos/categoryDto');
const ProductDto = require('../dtos/productDto');
const PromotionDto = require('../dtos/promotionDto');
const PostDto = require('../dtos/postDto');
const CreateReviewDto = require('../dtos/createReviewDto');
const dtoMiddleware = require('../middleware/dtoMiddleware');

const routerAPI = express.Router();
routerAPI.use(dtoMiddleware);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", validateWithDto(RegisterDto), createUser);
routerAPI.post("/login", validateWithDto(LoginDto), handleLogin);
routerAPI.post("/auth/refresh", handleRefreshToken);
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
routerAPI.get("/reviews/product/:productId", getProductReviews);
routerAPI.get("/products/:id/statistics", getProductStatistics);

routerAPI.use(authenticate);

routerAPI.post("/upload", upload.single("file"), uploadImage);
routerAPI.post("/reviews", validateWithDto(CreateReviewDto), createReview);
routerAPI.get("/reviews/me", getMyReviews);
routerAPI.put("/reviews/:reviewId", updateReview);
routerAPI.delete("/reviews/:reviewId", deleteReview);
routerAPI.get("/rewards/me", getMyRewards);
routerAPI.get("/vouchers/options", getVoucherOptions);
routerAPI.get("/vouchers/me", getMyVouchers);
routerAPI.post("/vouchers/redeem", redeemVoucher);
routerAPI.post("/vouchers/validate", validateVoucher);
routerAPI.post("/shipping/calculate", calculateShipping);

routerAPI.post("/favorites", addFavorite);
routerAPI.delete("/favorites/:productId", removeFavorite);
routerAPI.get("/favorites/me", getMyFavorites);

routerAPI.post("/view-history/:productId", addViewHistory);
routerAPI.get("/view-history/me", getMyViewHistory);

routerAPI.get("/account", delay, getAccount);
routerAPI.put("/account/profile", updateAccountProfile);
routerAPI.post("/auth/logout", handleLogout);
routerAPI.post("/account/addresses", addAccountAddress);
routerAPI.put("/account/addresses/:addressId", updateAccountAddress);
routerAPI.delete("/account/addresses/:addressId", deleteAccountAddress);
routerAPI.get("/cart", getCart);
routerAPI.post("/cart/items", addCartItem);
routerAPI.put("/cart/items/:slug", updateCartItem);
routerAPI.delete("/cart/items/:slug", removeCartItem);
routerAPI.delete("/cart", clearCart);

routerAPI.get("/orders", getOrders);
routerAPI.get("/orders/:id", getOrderDetail);
routerAPI.post("/orders/checkout", checkoutOrder);
routerAPI.post("/orders/:id/cancel", cancelOrder);
routerAPI.patch("/orders/:id/status", authorizeRoles('Admin', 'Staff'), updateOrderStatus);

routerAPI.get("/user", authorizeRoles('Admin'), getUser);
routerAPI.post("/user", authorizeRoles('Admin'), createAdminUser);
routerAPI.get("/user/:id", authorizeRoles('Admin'), getUserDetail);
routerAPI.put("/user/:id", authorizeRoles('Admin'), updateUser);
routerAPI.delete("/user/:id", authorizeRoles('Admin'), deleteUser);

routerAPI.post("/categories", authorizeRoles('Admin'), validateWithDto(CategoryDto), createCategory);
routerAPI.put("/categories/:slug", authorizeRoles('Admin'), validateWithDto(CategoryDto), updateCategory);
routerAPI.delete("/categories/:slug", authorizeRoles('Admin'), deleteCategory);

routerAPI.post("/promotions", authorizeRoles('Admin'), validateWithDto(PromotionDto), createPromotion);
routerAPI.put("/promotions/:slug", authorizeRoles('Admin'), validateWithDto(PromotionDto), updatePromotion);
routerAPI.delete("/promotions/:slug", authorizeRoles('Admin'), deletePromotion);

routerAPI.post("/posts", authorizeRoles('Admin'), validateWithDto(PostDto), createPost);
routerAPI.put("/posts/:slug", authorizeRoles('Admin'), validateWithDto(PostDto), updatePost);
routerAPI.delete("/posts/:slug", authorizeRoles('Admin'), deletePost);

routerAPI.post("/products", authorizeRoles('Admin'), validateWithDto(ProductDto), createProduct);
routerAPI.put("/products/:slug", authorizeRoles('Admin'), validateWithDto(ProductDto), updateProduct);
routerAPI.delete("/products/:slug", authorizeRoles('Admin'), deleteProduct);

module.exports = routerAPI;