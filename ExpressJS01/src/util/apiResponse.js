const ApiResponse = (success, message, data = null) => {
    return {
        success: Boolean(success),
        message: String(message || ''),
        data: data === undefined ? null : data,
    };
};

module.exports = ApiResponse;
