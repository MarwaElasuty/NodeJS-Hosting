const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Chapter = require('../models/chapter');
const Course = require('../models/course')
const Subscription = require('../models/subscription')
const Part = require('../models/part');
const { formatImageURL } = require('../helpers/scripts');
router.route('/')
    .get(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
            delete req.query.skip;

            // // check if admin 
            // const isAdmin = await adminGuard(req);
            // if (!isAdmin)  req.query.status = 1;


            if (req.query.searchText) {
                req.query.name = {
                    $regex: new RegExp(req.query.searchText, 'i')
                }
                delete req.query.searchText;
            }

            let sort = { name: 1 }
            if (req.query.sort) {
                sort = { sort: +req.query.sort }
                delete req.query.sort
            }


            const data = await Chapter.find(req.query)
                .sort(sort)
                .skip(skip)
                .limit(20)
                .populate("collage", { _id: 1, name: 1 })
                .populate("subject", { _id: 1, name: 1 })
                .populate("department", { _id: 1, name: 1 })
                .populate("division", { _id: 1, name: 1 })


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = new Chapter(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });


// route for chapter by course id ;
router.route('/:id')
    .get(verifyAccessToken, async(req, res, next) => {
        try {
            // get Subscriptions data;
            const subscriptions = await Subscription.find({
                user: req.payload.userId,
                status: 1
            });

            console.log(subscriptions);
            console.log("user ", req.payload.user);

            if (!subscriptions.length) throw createError.MethodNotAllowed("You are not allow to get this course");

            const coursesId = subscriptions.map(sub => sub.course)

            const course = await Course.findOne({
                _id: { $in: coursesId },
                status: { $ne: 0 },
                chapters: req.params.id
            });

            if (!course) throw createError.MethodNotAllowed("You are not allow to get this course");

            const chapter = await Chapter.findById(req.params.id)
                .populate("collage", { _id: 1, name: 1, nameEn: 1 })
                .populate("subject", { _id: 1, name: 1, nameEn: 1 })
                .populate("department", { _id: 1, name: 1, nameEn: 1 })
                .populate("division", { _id: 1, name: 1, nameEn: 1 })

            res.json(chapter);

        } catch (error) {
            next(error)
        }
    })
    .put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            await Chapter.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });

// get chapters by course id 

router.get('/course/:id', verifyAccessToken, async(req, res, next) => {
    try {

        // get Subscriptions data;
        const subscriptions = await Subscription.find({
            user: req.payload.userId,
            course: req.params.id,
            status: 1
        });

        if (!subscriptions.length) throw createError.MethodNotAllowed("You are not allow to get this course");


        const course = await Course.findById(req.params.id);
        if (!course || !course.status) throw createError.MethodNotAllowed("You are not allow to get this course");

        const chapter = await Chapter.find({ _id: { $in: course.chapters } })
        const chaptersId = chapter.map((c) => c._id.toString());

        const parts = await Part.find({
                chapter: { $in: chaptersId },
                status: 1,
            })
            .sort({ name: 1 })
            .populate("chapter", { _id: 1, name: 1, nameEn: 1 })

        for (let part of parts) {
            if (part.videos.length) part.videos = part.videos.map(video => formatImageURL(req, video))
            if (part.pdf.length) part.pdf = part.pdf.map(pdf => formatImageURL(req, pdf))
        }


        const result = chapter.map(c => c._doc)
        for (let ch of result) {
            ch.parts = parts.filter(p => p.chapter._id.toString() == ch._id.toString());
        }

        res.json(result);
        // const chapter = await Chapter.find({ _id: { $in: course.chapters } })
        //     .sort({ name: 1 })
        //     .populate([
        //         { path: "collage", select: '_id name' },
        //         { path: "subject", select: '_id name' },
        //         { path: "department", select: '_id name' },
        //         { path: "division", select: '_id name' },
        //     ])

        // res.json(chapter);

    } catch (error) {
        next(error);
    }
})



module.exports = router;