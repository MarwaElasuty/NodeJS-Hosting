const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');
const { formatImageURL, getTotalRating } = require('../helpers/scripts');
const Subscription = require('../models/subscription')
const Course = require('../models/course')
const Subject = require('../models/subject')
const Slide = require('../models/slide')
const Fav = require('../models/fav')


router.route('/')
    .get(verifyAccessToken, async(req, res, next) => {
        try {

            const skip = +req.query.skip >= 0 ? +req.query.skip * 50 : 0
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

            const courses = await Course.find(req.query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(50)


            for (const doc of courses) {
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
                doc._doc.pdf = [];
            }

            const topRateCourses = await Course.find({...req.query, rating: { $gte: 1 } })
                .sort({ rating: -1 })
                .skip(skip)
                .limit(50)


            for (const doc of topRateCourses) {
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
                doc._doc.pdf = [];
            }


            const slides = await Slide.find(req.query)
                .sort({ createdAt: -1 })


            for (let doc of slides) {
                if (doc.image) doc.image = formatImageURL(req, doc.image)
            }

            const subjects = await Subject.find(req.query)
                .sort({ createdAt: -1 })


            for (let doc of subjects) {
                if (doc.image) doc.image = formatImageURL(req, doc.image)
            }

            res.json({
                courses,
                topRateCourses,
                slides,
                subjects
            })



        } catch (error) {
            next(error)
        }
    })

module.exports = router;