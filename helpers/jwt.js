const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

const User = require('../models/user')
const Role = require('../models/role');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const secretKey = process.env.ACCESS_TOKEN_SECRET;
            jwt.sign({ userId }, secretKey, {}, (err, token) => {
                if (err) reject(createHttpError.InternalServerError());
                resolve(token)
            })
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const secretKey = process.env.REFRESH_TOKEN_SECRET;
            jwt.sign({ userId }, secretKey, { expiresIn: '1y' }, (err, token) => {
                if (err) {
                    reject(createHttpError.InternalServerError());
                } else resolve(token)
            })
        })
    },
    verifyAccessToken: async(req, res, next) => {
        try {
            // check if authorization header is exist
            const authHeader = req.headers['authorization'];
            if (!authHeader) throw createHttpError.Unauthorized()
            const bearerToken = authHeader.split(' ')[1];

            jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, async(err, payload) => {
                if (err) {
                    switch (err.name) {
                        case 'JsonWebTokenError': // if token is invalid
                            return next(createHttpError(406, "token is invalid"))
                        case 'TokenExpiredError': // if tokens is expired
                            return next(createHttpError(401, err.message));
                        default:
                            return next(createHttpError(401, err.message));
                    }
                }
                req.payload = payload;
                const user = await User.findById(req.payload.userId, { password: false });
                if (!user.status) return next(createHttpError(406, "تم تعطيل الحساب"));
                req.payload.user = user
                if (user.email == process.env.ADMIN_EMAIL) return next();
                const serial = req.headers['serial'];
                if (serial != user.serial) return next(createHttpError(406, "خطأ بالسيريال"));
                next()
            })
        } catch (error) {
            next(error)
        }
    },

    verifyRefreshToken: (refreshToken) => {
        try {
            return new Promise((resolve, reject) => {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                    if (!payload) reject(createHttpError(406, "Invalid refreshToken"))
                    const userId = payload.userId;
                    resolve(userId)
                })
            })
        } catch (error) {
            throw error
        }
    },

    isAdmin: async(req, res, next) => {
        try {
            const roles = await Role.find({ userId: req.payload.userId, role: "admin" });
            if (!roles.length) throw createHttpError(400, "غير مسموح لك")
            next();
        } catch (err) {
            next(err);
        }
    },

    adminGuard: async(req) => {
        try {
            const roles = await Role.find({ userId: req.payload.userId, role: "admin" });
            return roles.length;
        } catch (error) {
            throw error
        };
    }

}