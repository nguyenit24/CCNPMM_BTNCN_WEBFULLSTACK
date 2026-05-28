const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drhgr6w2v',
    api_key: process.env.CLOUDINARY_API_KEY || '835338165578132',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'J1LhW7nU2G7K9B1tL2U6y9H3d4e',
});

module.exports = cloudinary;
