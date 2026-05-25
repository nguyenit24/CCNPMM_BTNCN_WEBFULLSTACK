require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const normalizeText = (value, fallback = '') => String(value ?? fallback).trim();

const buildFormattedAddress = (address = {}) => {
    const parts = [
        address.line1,
        address.detail,
        address.ward,
        address.district,
        address.province,
        address.country,
    ]
        .map((part) => normalizeText(part))
        .filter(Boolean);

    return parts.join(', ');
};

const serializeAddress = (address) => {
    if (!address) {
        return null;
    }

    const source = typeof address.toObject === 'function' ? address.toObject() : address;
    const id = source._id?.toString?.() || source.id || null;

    return {
        id,
        _id: id,
        label: normalizeText(source.label, 'Địa chỉ') || 'Địa chỉ',
        recipientName: normalizeText(source.recipientName),
        phone: normalizeText(source.phone),
        line1: normalizeText(source.line1),
        ward: normalizeText(source.ward),
        district: normalizeText(source.district),
        province: normalizeText(source.province),
        country: normalizeText(source.country, 'Việt Nam') || 'Việt Nam',
        detail: normalizeText(source.detail),
        googleMapsLink: normalizeText(source.googleMapsLink),
        isDefault: Boolean(source.isDefault),
        formattedAddress: buildFormattedAddress(source),
        createdAt: source.createdAt || null,
        updatedAt: source.updatedAt || null,
    };
};

const serializeUser = (user) => {
    if (!user) {
        return null;
    }

    const source = typeof user.toObject === 'function' ? user.toObject() : user;
    const id = source._id?.toString?.() || source.id || null;
    const addresses = Array.isArray(source.addresses) ? source.addresses.map(serializeAddress).filter(Boolean) : [];
    const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;

    return {
        id,
        _id: id,
        name: normalizeText(source.name),
        email: normalizeText(source.email),
        role: normalizeText(source.role, 'Member') || 'Member',
        addresses,
        defaultAddress,
    };
};

const normalizeAddressPayload = (payload = {}) => {
    const recipientName = normalizeText(payload.recipientName || payload.name || payload.fullName);
    const phone = normalizeText(payload.phone);
    const line1 = normalizeText(payload.line1 || payload.addressLine1 || payload.street);
    const ward = normalizeText(payload.ward || payload.commune);
    const district = normalizeText(payload.district || payload.city);
    const province = normalizeText(payload.province || payload.state);
    const country = normalizeText(payload.country, 'Việt Nam') || 'Việt Nam';

    if (!recipientName) {
        throw createError(400, 'Vui lòng nhập tên người nhận');
    }

    if (!phone) {
        throw createError(400, 'Vui lòng nhập số điện thoại');
    }

    if (!line1) {
        throw createError(400, 'Vui lòng nhập số nhà, tên đường');
    }

    if (!ward || !district || !province) {
        throw createError(400, 'Vui lòng nhập đầy đủ phường/xã, quận/huyện và tỉnh/thành phố');
    }

    return {
        label: normalizeText(payload.label, 'Địa chỉ') || 'Địa chỉ',
        recipientName,
        phone,
        line1,
        ward,
        district,
        province,
        country,
        detail: normalizeText(payload.detail),
        googleMapsLink: normalizeText(payload.googleMapsLink),
        isDefault: Boolean(payload.isDefault || payload.default || payload.setDefault),
    };
};

const applyDefaultAddressRule = (addresses = [], preferredAddressId = null) => {
    if (!addresses.length) {
        return addresses;
    }

    const normalized = addresses.map((address) => ({
        ...address,
        isDefault: Boolean(address.isDefault),
    }));

    let defaultIndex = normalized.findIndex((address) => address.isDefault);

    if (preferredAddressId) {
        const preferredIndex = normalized.findIndex((address) => address._id?.toString?.() === preferredAddressId);
        if (preferredIndex !== -1) {
            defaultIndex = preferredIndex;
        }
    }

    if (defaultIndex === -1) {
        defaultIndex = 0;
    }

    return normalized.map((address, index) => ({
        ...address,
        isDefault: index === defaultIndex,
    }));
};

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
            role: "Member",
            addresses: []
        })
        return serializeUser(result);
    } catch (error) {
        console.log(error);
        return null;
    }
}

const createAdminUserService = async (name, email, password, role) => {
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
            role: role || "Member",
            addresses: []
        });
        return serializeUser(result);
    } catch (error) {
        console.log(error);
        return null;
    }
};


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
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role || "Member"
                }
                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_ACCESS_EXPIRE || process.env.JWT_EXPIRE || '1h'
                    }
                )
                const refresh_token = jwt.sign(
                    { id: user._id.toString() },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
                    }
                )
                user.refreshToken = refresh_token;
                await user.save();

                return {
                    EC: 0,
                    access_token,
                    refresh_token,
                    user: serializeUser(user)
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
        return result.map((user) => serializeUser(user));
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserDetailService = async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) {
        return null;
    }

    return serializeUser(user);
};

const getAccountService = async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) {
        throw createError(404, 'User not found');
    }

    return serializeUser(user);
};

const addAddressService = async (id, payload = {}) => {
    const user = await User.findById(id);
    if (!user) {
        throw createError(404, 'User not found');
    }

    const address = normalizeAddressPayload(payload);
    const isDefault = Boolean(address.isDefault || user.addresses.length === 0);

    if (isDefault) {
        user.addresses.forEach((item) => {
            item.isDefault = false;
        });
    }

    user.addresses.push({
        ...address,
        isDefault,
    });

    user.addresses = applyDefaultAddressRule(user.addresses);
    await user.save();

    return serializeUser(user);
};

const updateAddressService = async (id, addressId, payload = {}) => {
    const user = await User.findById(id);
    if (!user) {
        throw createError(404, 'User not found');
    }

    const address = user.addresses.id(addressId);
    if (!address) {
        throw createError(404, 'Address not found');
    }

    const nextAddress = normalizeAddressPayload({
        recipientName: payload.recipientName ?? address.recipientName,
        phone: payload.phone ?? address.phone,
        line1: payload.line1 ?? address.line1,
        ward: payload.ward ?? address.ward,
        district: payload.district ?? address.district,
        province: payload.province ?? address.province,
        country: payload.country ?? address.country,
        detail: payload.detail ?? address.detail,
        googleMapsLink: payload.googleMapsLink ?? address.googleMapsLink,
        label: payload.label ?? address.label,
        isDefault: payload.isDefault ?? address.isDefault,
    });

    address.label = nextAddress.label;
    address.recipientName = nextAddress.recipientName;
    address.phone = nextAddress.phone;
    address.line1 = nextAddress.line1;
    address.ward = nextAddress.ward;
    address.district = nextAddress.district;
    address.province = nextAddress.province;
    address.country = nextAddress.country;
    address.detail = nextAddress.detail;
    address.googleMapsLink = nextAddress.googleMapsLink;
    address.isDefault = Boolean(nextAddress.isDefault);

    user.addresses = applyDefaultAddressRule(user.addresses, address._id?.toString?.());
    await user.save();

    return serializeUser(user);
};

const deleteAddressService = async (id, addressId) => {
    const user = await User.findById(id);
    if (!user) {
        throw createError(404, 'User not found');
    }

    const nextAddresses = user.addresses.filter((address) => address._id?.toString?.() !== addressId);
    user.addresses = applyDefaultAddressRule(nextAddresses);
    await user.save();

    return serializeUser(user);
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
    return serializeUser(result);
};

const updateAccountProfileService = async (userId, payload = {}) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "User not found");
    }

    if (payload.name !== undefined) {
        const name = String(payload.name || '').trim();
        if (!name) {
            throw createError(400, "Tên không được để trống");
        }
        user.name = name;
    }

    if (payload.email !== undefined) {
        const email = String(payload.email || '').trim();
        if (!email) {
            throw createError(400, "Email không được để trống");
        }
        if (email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) {
                throw createError(409, "Email đã tồn tại");
            }
            user.email = email;
        }
    }

    if (payload.address !== undefined) {
        const addrPayload = payload.address || {};
        const line1 = String(addrPayload.line1 || '').trim();
        const ward = String(addrPayload.ward || '').trim();
        const district = String(addrPayload.district || '').trim();
        const province = String(addrPayload.province || '').trim();
        const country = String(addrPayload.country || 'Việt Nam').trim();
        const detail = String(addrPayload.detail || '').trim();
        const googleMapsLink = String(addrPayload.googleMapsLink || '').trim();

        let defaultAddr = user.addresses.find(a => a.isDefault);
        if (!defaultAddr && user.addresses.length > 0) {
            defaultAddr = user.addresses[0];
        }

        if (defaultAddr) {
            defaultAddr.line1 = line1;
            defaultAddr.ward = ward;
            defaultAddr.district = district;
            defaultAddr.province = province;
            defaultAddr.country = country;
            defaultAddr.detail = detail;
            defaultAddr.googleMapsLink = googleMapsLink;
            defaultAddr.isDefault = true;
        } else {
            user.addresses.push({
                label: 'Địa chỉ mặc định',
                recipientName: user.name,
                phone: '---',
                line1,
                ward,
                district,
                province,
                country,
                detail,
                googleMapsLink,
                isDefault: true
            });
        }
    }

    await user.save();
    return serializeUser(user);
};

const deleteUserService = async (id) => {
    const user = await User.findByIdAndDelete(id).select("-password");
    return user;
};

const handleRefreshTokenService = async (refreshToken) => {
    try {
        if (!refreshToken) return null;
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return null;
        }

        const payload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "Member"
        };

        const access_token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRE || process.env.JWT_EXPIRE || '1h' }
        );

        const new_refresh_token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
        );

        user.refreshToken = new_refresh_token;
        await user.save();

        return {
            access_token,
            refresh_token: new_refresh_token,
            user: serializeUser(user)
        };
    } catch (error) {
        console.log("Error in handleRefreshTokenService:", error);
        return null;
    }
};

const logoutService = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.refreshToken = '';
            await user.save();
            return true;
        }
        return false;
    } catch (error) {
        console.log("Error in logoutService:", error);
        return false;
    }
};

module.exports = {
    createUserService,
    createAdminUserService,
    loginService,
    getUserService,
    getUserDetailService,
    getAccountService,
    addAddressService,
    updateAddressService,
    deleteAddressService,
    updateUserService,
    updateAccountProfileService,
    deleteUserService,
    handleRefreshTokenService,
    logoutService,
}