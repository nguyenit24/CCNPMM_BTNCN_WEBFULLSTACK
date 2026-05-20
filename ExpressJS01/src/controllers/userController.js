const {
    createUserService,
    loginService,
    getUserService,
    getUserDetailService,
    getAccountService,
    addAddressService,
    updateAddressService,
    deleteAddressService,
    updateUserService,
    deleteUserService,
} = require("../services/userService");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

const getAccount = async (req, res) => {
    try {
        const data = await getAccountService(req.user.id);
        return res.status(200).json(data)
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

const addAccountAddress = async (req, res) => {
    try {
        const data = await addAddressService(req.user.id, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

const updateAccountAddress = async (req, res) => {
    try {
        const data = await updateAddressService(req.user.id, req.params.addressId, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

const deleteAccountAddress = async (req, res) => {
    try {
        const data = await deleteAddressService(req.user.id, req.params.addressId);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

const getUserDetail = async (req, res) => {
    try {
        const data = await getUserDetailService(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
}

const updateUser = async (req, res) => {
    try {
        const data = await updateUserService(req.params.id, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const data = await deleteUserService(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
}

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    addAccountAddress,
    updateAccountAddress,
    deleteAccountAddress,
    getUserDetail,
    updateUser,
    deleteUser,
}