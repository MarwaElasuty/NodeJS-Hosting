const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');
const { formatImageURL, getTotalRating } = require('../helpers/scripts');


const Course = require("../models/course")
const Fav = require('../models/fav');
const Subscription = require('../models/subscription');


router.route('/')
    .get(verifyAccessToken, async(req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 100 : 0
            delete req.query.skip;

            // check if admin 
            const isAdmin = await adminGuard(req);
            if (!isAdmin) req.query.status = 1;



            if (req.query.searchText) {
                req.query.name = {
                    $regex: new RegExp(req.query.searchText, 'i')
                }
                delete req.query.searchText;
            }

            const data = await Course.find(req.query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(100)


            for (const doc of data) {
                // fav;
                const inFav = await Fav.findOne({
                    user: req.payload.userId,
                    course: doc._id
                })
                if (inFav) doc.inFav = true


                const subscription = await Subscription.findOne({
                    course: doc._id,
                    user: req.payload.userId,
                    status: { $ne: 0 }
                });

                if (!subscription) {
                    doc.isSubscriber = false;
                    doc.pdf = [];
                } else {
                    doc.isSubscriber = true
                }

                // cover
                if (doc._doc.cover) doc._doc.cover = formatImageURL(req, doc._doc.cover);
            }

            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = new Course(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });

router.route('/:id')
    .get(verifyAccessToken, async(req, res, next) => {
        try {
            const subscription = await Subscription.findOne({
                course: req.params.id,
                user: req.payload.userId,
                status: { $ne: 0 }
            });

            const inFav = await Fav.findOne({
                user: req.payload.userId,
                course: req.payload.userId
            })

            let course = {};

            if (!subscription) {
                course = await Course.findById(req.params.id)
                course.isSubscriber = false;
                if (inFav) course.inFav = true;
                course.pdf = [];
                return res.json(course);
            }

            course = await Course.findById(req.params.id)
                .populate("collage", { _id: 1, name: 1 })
                .populate("subject", { _id: 1, name: 1 })
                .populate("department", { _id: 1, name: 1 })
                .populate("division", { _id: 1, name: 1 })
                .populate("chapters", { _id: 1, name: 1 })



            if (inFav) course.inFav = true;
            course.isSubscriber = true;
            if (course._doc.cover) course._doc.cover = formatImageURL(req, course._doc.cover);

            // pdf;
            if (course.pdf.length) course.pdf = course.pdf.map(pdf => formatImageURL(req, pdf))

            res.json(course);

        } catch (error) {
            next(error);
        }
    })
    .put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const updatedData = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedData)
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const updatedData = await Course.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json(updatedData)
        } catch (error) {
            next(error)
        }
    });

router.get('/subscription/me', verifyAccessToken, async(req, res, next) => {
    try {

        // get Subscriptions data;
        const subscriptions = await Subscription.find({
            user: req.payload.userId,
            status: 1
        });

        if (!subscriptions.length) return res.json([]);

        req.query._id = { $in: subscriptions.map(sub => sub.course) };

        const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
        delete req.query.skip;

        req.query.status = { $ne: 0 };

        if (req.query.searchText) {
            req.query.name = {
                $regex: new RegExp(req.query.searchText, 'i')
            }
            delete req.query.searchText;
        }

        const data = await Course.find(req.query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(20)


        for (const doc of data) {
            // fav;
            const inFav = await Fav.findOne({
                user: req.payload.userId,
                course: doc._id
            })
            if (inFav) doc.inFav = true
            doc.subscription = true;
            // cover
            if (doc._doc.cover) doc._doc.cover = formatImageURL(req, doc._doc.cover);
            doc._doc.pdf = [];
        }

        res.json(data);
    } catch (error) {
        next(error)
    }
})



module.exports = router;