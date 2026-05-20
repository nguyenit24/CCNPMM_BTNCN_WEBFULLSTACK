const ApiResponse = require('../util/apiResponse');

const dtoMiddleware = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
        // If body is already in standard DTO format, just send it
        if (body && typeof body === 'object' && 'success' in body && 'message' in body && 'data' in body) {
            return originalJson.call(this, body);
        }

        // Determine if request is successful based on the HTTP status code
        let success = res.statusCode >= 200 && res.statusCode < 300;
        let message = success ? 'Thành công' : 'Đã xảy ra lỗi';
        let data = body;

        // If body is a legacy EC/EM object (Common backend pattern in this repo)
        if (body && typeof body === 'object') {
            if (body.EC !== undefined) {
                const oldSuccess = body.EC === 0;
                success = success && oldSuccess;

                if (!success && res.statusCode >= 200 && res.statusCode < 300) {
                    res.status(400);
                }

                return originalJson.call(this, ApiResponse(
                    success,
                    body.EM || (success ? 'Thành công' : 'Đã xảy ra lỗi'),
                    oldSuccess ? body : null
                ));
            }

            // Handle standard message and data structures
            if (body.message) {
                message = body.message;
                data = body.data !== undefined ? body.data : null;
            } else if (body.error) {
                message = typeof body.error === 'string' ? body.error : (body.error.message || message);
                data = null;
            }
        }

        return originalJson.call(this, ApiResponse(success, message, data));
    };

    next();
};

module.exports = dtoMiddleware;
