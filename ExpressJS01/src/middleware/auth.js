require('dotenv').config()
const jwt = require("jsonwebtoken");
const User = require('../models/user');

const authenticate = (req, res, next) => {
    if (req.headers.authorization?.split(' ')[1]) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const attachUser = async () => {
                if (decoded.id) {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        name: decoded.name,
                        role: decoded.role || "Member"
                    };
                    return next();
                }

                const user = await User.findOne({ email: decoded.email }).lean();
                if (!user) {
                    return res.status(401).json({
                        message: "Token bị hết hạn/hoặc không hợp lệ"
                    });
                }

                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role || "Member"
                };
                return next();
            };

            attachUser().catch(() => {
                return res.status(401).json({
                    message: "Token bị hết hạn/hoặc không hợp lệ"
                });
            });
        } catch (error) {
            return res.status(401).json({
                message: "Token bị hết hạn/hoặc không hợp lệ"
            })
        }
    } else {
        return res.status(401).json({
            message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn"
        })
    }
}

const authorizeRoles = (...roles) => {
    const normalizedRoles = roles.map((role) => String(role || '').toLowerCase());

    return (req, res, next) => {
        const userRole = String(req.user?.role || '').toLowerCase();
        if (!userRole || !normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập tài nguyên này"
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorizeRoles,
};