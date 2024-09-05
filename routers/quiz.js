const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Quiz = require('../models/quiz');
const Chapter = require('../models/chapter');
const Course = require('../models/course')
const Part = require('../models/part')
const Subscription = require('../models/subscription');
const Questions = require('../models/questions')
const { formatImageURL } = require('../helpers/scripts');

router.route('/')
    .get(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            // limit and skip
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
            delete req.query.skip;


            const data = await Quiz.find(req.query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(20);


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = new Quiz(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });


router.route('/:id')
    .get(verifyAccessToken, async(req, res, next) => {
        try {
            const quiz = await Quiz.findById(req.params.id);
            if (!quiz || !quiz.status) throw createError.NotFound("بيانات الاختبار غير موجودة");

            // courses that includes quiz chapters;
            const courses = await Course.find({
                chapters: quiz.chapter,
                status: { $ne: 0 }
            });

            if (!courses.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");


            // check subscriptions that have userId and any of these courses; 
            const coursesId = courses.map(course => course._id.toString());
            const subscriptions = await Subscription.find({
                user: req.payload.userId,
                course: { $in: coursesId },
                status: 1
            });
            if (!subscriptions.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");

            // QUESTIONS
            // limit and skip
            const skip = +req.query.skip >= 0 ? +req.query.skip : 0
            const limit = +req.query.limit >= 1 ? +req.query.limit : 1;
            delete req.query.skip;
            delete req.query.limit;

            // sort data;
            let sort = { difficulty: 1 }
            if (req.query.sortByDifficulty) {
                sort = { difficulty: req.query.sortByDifficulty }
                delete req.query.sortByDifficulty
            }
            if (req.query.sortByDegree) {
                sort = { difficulty: req.query.sortByDegree }
                delete req.query.sortByDegree
            }

            const questionsId = quiz.questions.map(q => q.toString());

            const questions = await Questions.find({
                    _id: { $in: questionsId },
                    status: 1,
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate("collage", { _id: 1, name: 1 })
                .populate("subject", { _id: 1, name: 1 })
                .populate("department", { _id: 1, name: 1 })
                .populate("division", { _id: 1, name: 1 })
                .populate("chapter", { _id: 1, name: 1 })
                .populate("part", { _id: 1, name: 1 })


            for (let doc of questions) {
                if (doc.image) doc.image = formatImageURL(req, doc.image);
            }

            res.json(questions);

        } catch (error) {
            next(error)
        }
    })

.put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            await Quiz.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });

router.get('/:id/admin', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {

        // limit and skip
        const skip = +req.query.skip >= 0 ? +req.query.skip : 0
        delete req.query.skip;

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw createError.NotFound("بيانات الاختبار غير موجودة");

        if (req.query.searchText) {
            req.query.name = {
                $regex: new RegExp(req.query.searchText, 'i')
            }
            delete req.query.searchText;
        }

        const questionsId = quiz.questions.map(q => q.toString());
        req.query._id = { $in: questionsId }

        const questions = await Questions.find(req.query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(20)
            .populate("collage", { _id: 1, name: 1 })
            .populate("subject", { _id: 1, name: 1 })
            .populate("department", { _id: 1, name: 1 })
            .populate("division", { _id: 1, name: 1 })
            .populate("chapter", { _id: 1, name: 1 })
            .populate("part", { _id: 1, name: 1 })

        res.json(questions)
    } catch (error) {
        next(error)
    }
});

router.get('/chapter/:id', verifyAccessToken, async(req, res, next) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter || !chapter.status) throw createError.NotFound("بيانات الدرس غير موجودة");


        // courses that includes quiz chapters;
        const courses = await Course.find({
            chapters: req.params.id,
            status: { $ne: 0 }
        });

        if (!courses.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");


        // check subscriptions that have userId and any of these courses; 
        const coursesId = courses.map(course => course._id.toString());
        const subscriptions = await Subscription.find({
            user: req.payload.userId,
            course: { $in: coursesId },
            status: 1
        });
        if (!subscriptions.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");


        const quiz = await Quiz.find({
            chapter: req.params.id,
            status: 1,
        });
        if (!quiz || !quiz.status) throw createError.NotFound("بيانات الاختبار غير موجودة");


        res.json(quiz);


    } catch (error) {
        next(error)
    }
})

router.get('/part/:id', verifyAccessToken, async(req, res, next) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part || !part.status) throw createError.NotFound("بيانات الدرس غير موجودة");

        const chapter = await Chapter.findById(part.chapter);
        if (!chapter || !chapter.status) throw createError.NotFound("بيانات الدرس غير موجودة");



        // courses that includes quiz chapters;
        const courses = await Course.find({
            chapters: part.chapter,
            status: { $ne: 0 }
        });

        if (!courses.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");


        // check subscriptions that have userId and any of these courses; 
        const coursesId = courses.map(course => course._id.toString());
        const subscriptions = await Subscription.find({
            user: req.payload.userId,
            course: { $in: coursesId },
            status: 1
        });
        if (!subscriptions.length) throw createError.Forbidden("انت غير مشترك في هذا الاختبار");


        const quiz = await Quiz.find({
            chapter: part.chapter,
            part: req.params.id,
            status: 1,
        });

        if (!quiz.length) throw createError.NotFound("بيانات الاختبار غير موجودة");


        res.json(quiz);


    } catch (error) {
        next(error)
    }
})


module.exports = router;