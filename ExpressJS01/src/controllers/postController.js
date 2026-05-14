const {
    getPostsService,
    getPostDetailService,
    createPostService,
    updatePostService,
    deletePostService,
} = require('../services/postService');

const getPosts = async (req, res) => {
    try {
        const data = await getPostsService(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const getPostDetail = async (req, res) => {
    try {
        const data = await getPostDetailService(req.params.slug);

        if (!data.post && data.emptyCollection) {
            return res.status(200).json(data);
        }

        if (!data.post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const createPost = async (req, res) => {
    try {
        const data = await createPostService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updatePost = async (req, res) => {
    try {
        const data = await updatePostService(req.params.slug, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const deletePost = async (req, res) => {
    try {
        const data = await deletePostService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getPosts,
    getPostDetail,
    createPost,
    updatePost,
    deletePost,
};