const express = require('express');
const router = express.Router();
const createError = require('http-errors')

const User = require("../models/user")
const bcrypt = require("bcrypt");

const { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken, adminGuard, isAdmin } = require('../helpers/jwt');
const { formatImageURL, admin } = require('../helpers/scripts')



router.post('/register', async(req, res, next) => {
    try {
        if (!req.body.serial) throw createError.BadRequest("serial is required")
        const { email } = req.body
        
        const doesExits = await User.findOne({ email })
        if (doesExits) throw createError.Conflict("هذا البريد الإلكتروني موجود بالفعل");

        delete req.body.status;
       
        const user = new User(req.body);
        const savedUser = await user.save();
        if(req.body.isAdmin){
            admin(user.email);
        }
        const accessToken = await signAccessToken(savedUser._id)
        const refreshToken = await signRefreshToken(savedUser._id);

        delete savedUser._doc.password

        res.json({
            ...savedUser._doc,
            accessToken,
            refreshToken
        })
    } catch (error) {
        next(error)
    }
})

router.post('/login', async(req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })

        if (!user) throw createError.NotFound('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        
        if (user.serial != req.body.serial) throw createError.Forbidden("لا يمكنك تسجيل الدخول من هذا الجهاز")

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) throw createError.NotFound('البريد الإلكتروني أو كلمة المرور غير صحيحة');

        if (req.body.serial != user.serial) throw createError.BadRequest("لايمكن تسجيل الدخول من هذا الجهاز")


        if (!user.status) throw createError.Forbidden()

        const role = await Role.findOne({ userId: user._id });
        if (role && role.role === 'admin') {
            throw createError.Forbidden('لا يمكن تسجيل الدخول كمشرف');
        }

        const accessToken = await signAccessToken(user._id)
        const refreshToken = await signRefreshToken(user._id);
        delete user._doc.password

        const data = {
            ...user._doc,
            accessToken,
            refreshToken
        }
        res.send(data)
    } catch (error) {
        next(error)
    }
});

router.post('/adminLogin', async (req, res, next) => {
    try {
        const { email, password, serial } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw createError.NotFound('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        // Validate the password
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            throw createError.NotFound('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        // Check if the serial number matches
        if (serial !== user.serial) {
            throw createError.BadRequest('لايمكن تسجيل الدخول من هذا الجهاز');
        }

        // Check if the user is active
        if (!user.status) {
            throw createError.Forbidden('الحساب غير مفعل');
        }

        let role = await Role.findOne({ userId: user._id, role: 'admin' });
        if (!role) {
            throw createError.Forbidden('هذا المستخدم لا يملك صلاحيات الإدارة');
        }

        const accessToken = await signAccessToken(user._id);
        const refreshToken = await signRefreshToken(user._id);

        delete user._doc.password;
        res.json({
            ...user._doc,
            accessToken,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', verifyAccessToken, async(req, res, next) => {
    try {
        const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0;
        delete req.query.skip

        if (req.query.searchText) {
            req.query.displayName = {
                $regex: new RegExp(req.query.searchText, 'i')
            }
            delete req.query.searchText;
        }

        const isSuperAdmin = await adminGuard(req);
        if (!isSuperAdmin) {
            if (req.payload.user.image) req.payload.user.image = formatImageURL(req, req.payload.user.image);
            return res.json(req.payload.user)
        }

        // SuperAdmin 
        const users = await User.find(req.query, { password: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(20)


        for (let user of users) {
            if (user._doc.image) user._doc.image = formatImageURL(req, user._doc.image)
        }

        res.json(users);
    } catch (error) {
        console.log(error);
        next(error)
    }
});

router.get('/count', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {
        const users = await User.count(req.query)
        res.json({ count: users });
    } catch (error) {
        next(error)
    }
});

router.route('/:id')
    .put(verifyAccessToken, async(req, res, next) => {
        try {
            const reqUser = req.payload.user;
            const isAdmin = await adminGuard(req);

            if (!isAdmin) {
                delete req.body.status;
                delete req.body.serial
                if (reqUser._id != req.params.id) throw createError.Forbidden("غير مسموح لك بالتعديل")
            }


            // update email
            if (req.body.email && req.body.email != reqUser.email) {
                const doesExits = await User.findOne({ email: req.body.email })
                if (doesExits) throw createError.Conflict("هذا البريد الإلكتروني موجود بالفعل")
            }

            // update password
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                req.body.password = hashedPassword;
            }



            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            delete updatedUser.password;

            res.json(updatedUser)

        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, async(req, res, next) => {
        try {
            const admin = await adminGuard(req);
            if (!admin && req.payload.userId != req.params.id) throw createError.Forbidden("غير مسموح لك بالحذف")
            await User.findByIdAndUpdate(req.params.id, { status: 0 });
            return res.json({ status: 200, message: "Deleted Success" });
        } catch (error) {
            next(error)
        }
    })


router.get('/refreshToken', async(req, res, next) => {
    try {
        const { token } = req.query
        if (!token) throw createError.BadRequest("Token is required");

        const userId = await verifyRefreshToken(token);
        const user = await User.findById(userId);

        if (!user.status) throw createError.NotAcceptable("تم حظر هذا الحساب, برجاء التواصل مع الادارة")

        const accessToken = await signAccessToken(userId);
        const refreshToken = await signRefreshToken(userId);


        res.json({
            accessToken,
            refreshToken
        })
    } catch (error) {
        next(error)
    }
});

module.exports = router;