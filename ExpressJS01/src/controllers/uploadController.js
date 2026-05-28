const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ApiResponse = require('../util/apiResponse');

// Multer in-memory storage config
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // limit 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ được tải lên file ảnh!'), false);
        }
    }
});

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(ApiResponse(false, 'Không có file nào được tải lên', null));
        }

        // Upload stream to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'techstudio/reviews',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadStream();
        return res.status(200).json(ApiResponse(true, 'Tải lên hình ảnh thành công', {
            url: result.secure_url,
            public_id: result.public_id
        }));

    } catch (error) {
        console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
        return res.status(500).json(ApiResponse(false, error.message || 'Lỗi khi tải ảnh lên Cloudinary', null));
    }
};

module.exports = {
    upload,
    uploadImage
};
