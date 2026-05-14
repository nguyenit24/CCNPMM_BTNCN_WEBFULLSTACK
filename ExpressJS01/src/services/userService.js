require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        const hashPassword = await bcrypt.hash(password, saltRounds);
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "Member"
        })
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                }
            } else {
                const payload = {
                    email: user.email,
                    name: user.name,
                    role: user.role || "Member"
                }
                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                )
                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name,
                        role: user.role || "Member"
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const getUserDetailService = async (id) => {
    const user = await User.findById(id).select("-password");
    return user;
};

const updateUserService = async (id, payload = {}) => {
    const user = await User.findById(id);
    if (!user) {
        throw createError(404, "User not found");
    }

    if (payload.name !== undefined) {
        const name = String(payload.name || '').trim();
        if (!name) {
            throw createError(400, "User name is required");
        }
        user.name = name;
    }

    if (payload.email !== undefined) {
        const email = String(payload.email || '').trim();
        if (!email) {
            throw createError(400, "User email is required");
        }
        if (email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) {
                throw createError(409, "Email already exists");
            }
            user.email = email;
        }
    }

    if (payload.role !== undefined) {
        const role = String(payload.role || '').trim();
        if (!role) {
            throw createError(400, "User role is required");
        }
        user.role = role;
    }

    if (payload.password !== undefined) {
        const password = String(payload.password || '').trim();
        if (!password) {
            throw createError(400, "Password is required");
        }
        user.password = await bcrypt.hash(password, saltRounds);
    }

    await user.save();

    const result = user.toObject();
    delete result.password;
    return result;
};

const deleteUserService = async (id) => {
    const user = await User.findByIdAndDelete(id).select("-password");
    return user;
};

module.exports = {
    createUserService,
    loginService,
    getUserService,
    getUserDetailService,
    updateUserService,
    deleteUserService,
}