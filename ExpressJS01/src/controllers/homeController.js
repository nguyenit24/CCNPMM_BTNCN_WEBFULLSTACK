const { getHomeService } = require('../services/homeService');

const getHomepage = async (req, res) => {
    return res.render('index.ejs');
};

const getHome = async (req, res) => {
    try {
        const data = await getHomeService({
            email: req.user?.email ?? '',
            name: req.user?.name ?? '',
            role: req.user?.role ?? 'Member',
        });

        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getHomepage,
    getHome,
};