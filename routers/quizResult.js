const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin } = require('../helpers/jwt');
const { formatImageURL } = require('../helpers/scripts');

const Questions = require('../models/questions');
const QuizResult = require('../models/quizResult');
const Quiz = require('../models/quiz');

router.route('/')
    .get(verifyAccessToken, async(req, res, next) => {
        try {


            req.query.user = req.payload.userId;

            const data = await QuizResult.findOne(req.query)
                .sort({ createdAt: -1 })
                .populate("quiz", { _id: 1, name: 1 })
                .populate("user", { _id: 1, name: 1 });

            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, async(req, res, next) => {
        try {
            if (!req.body.quiz) throw createError.BadRequest("quiz is required");
            const isExist = await QuizResult.findOne({
                quiz: req.body.quiz,
                user: req.payload.userId
            });

            if (isExist) throw createError.BadRequest("تم حضور هذا الاختبار");

            req.body.user = req.payload.userId

            const quiz = await Quiz.findById(req.body.quiz)
            if (!quiz) throw createError.NotFound("هذا الاختبار غير موجود");
            const questions = await Questions.find({
                status: 1,
                _id: { $in: quiz.questions }
            })


            let maxDegree = 0;
            for (let question of questions) {
                maxDegree += question.degree
                if (question.nestedQuestions.length) {
                    question.nestedQuestions.forEach((nestedQuestion) => {
                        maxDegree += nestedQuestion.degree;
                    });
                }
            }

            req.body.maxDegree = maxDegree

            const data = new QuizResult(req.body);

            const saved = await data.save();
            return res.json(saved)

        } catch (error) {
            next(error)
        }
    });

router.delete('/:id', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {
        await QuizResult.findByIdAndDelete(req.params.id);
        res.json({ status: 200, message: "success" })
    } catch (error) {
        next(error)
    }
})



module.exports = router;