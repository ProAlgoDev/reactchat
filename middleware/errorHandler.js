const dotenv = require("dotenv");
dotenv.config();

exports.errorHandler = async (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        messege: err.messege,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    })
}