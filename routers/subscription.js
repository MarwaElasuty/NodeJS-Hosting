const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Subscription = require('../models/subscription');
const Course = require('../models/course');

const { generateRandomString } = require('../helpers/scripts');

router.route('/')
    .get(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
            delete req.query.skip;


            if (req.query.searchText) {
                req.query.code = {
                    $regex: new RegExp(req.query.searchText, 'i')
                }
                delete req.query.searchText;
            }

            const data = await Subscription.find(req.query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(20)
                .populate("course", { _id: 1, name: 1 })
                .populate("user", { _id: 1, displayName: 1, email: 1 })


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            let codes = await Subscription.find({}, { code: 1 });
            codes = codes.map(code => code.code);
            req.body.code = generateRandomString(codes);

            const data = new Subscription(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });

router.post('/code', verifyAccessToken, async(req, res, next) => {
    try {
        if (!req.body.code) throw createError.BadGateway("Code is required");
        const subscriptionData = await Subscription.findOne({ code: req.body.code });

        if (!subscriptionData) throw createError.NotFound("This code not exist")
        if (!subscriptionData.status) throw createError.Forbidden("This code is not valid")
        if (subscriptionData.user) {
            if (subscriptionData.user.toString() == req.payload.userId) throw createError.Conflict("Already subscribed to this course");
            throw createError.Gone("This code is old, someone use it")
        };
        const data = await Subscription.findByIdAndUpdate(subscriptionData._id, { user: req.payload.userId }, { new: true });

        const subscriptionCount = await Subscription.count({
            user: { $ne: null },
            course: subscriptionData.course,
            status: 1
        })

        await Course.findByIdAndUpdate(subscriptionData.course.toString(), { subscribers: subscriptionCount })

        res.json(data);


    } catch (error) {
        next(error)
    }
})

router.route('/:id')
    .put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            await Subscription.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });

router.get('/myLearn', verifyAccessToken, async(req, res, next) => {
    try {
        const subscriptionCount = await Subscription.count({
            user: req.payload.userId,
            course: { $ne: null },
            status: 1
        });

        res.json({ count: subscriptionCount })

    } catch (error) {
        next(error)
    }
})





module.exports = router;