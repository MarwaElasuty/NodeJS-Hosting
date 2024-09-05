const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Questions = require('../models/questions');
const Chapter = require('../models/chapter');
const Course = require('../models/course')
const Part = require('../models/part')
const Subscription = require('../models/subscription');
const { formatImageURL } = require('../helpers/scripts');

router.route('/')
    .get(verifyAccessToken, async (req, res, next) => {
        try {
            // limit and skip
            const skip = +req.query.skip >= 0 ? +req.query.skip : 0
            const limit = +req.query.limit >= 1 ? +req.query.limit : 1;
            delete req.query.skip;
            delete req.query.limit;

            // get subscriptions for this user;
            const subscriptions = await Subscription.find({
                user:req.payload.userId,
                status:1
            })
            .populate({
                path:"course",
                match:{status:{$ne:0}}
            });


            if(!subscriptions.length) throw createError.MethodNotAllowed("You are not allow");

            // courses that user subscribe to it;
            const courses = subscriptions.map(sub => sub.course);
            if(!courses.length) throw createError.MethodNotAllowed("You are not allow");


            // Get unique chapters ids;
            let chaptersId = courses.flatMap(course => course.chapters)
            chaptersId = chaptersId.map(chapter => chapter.toString());
            const uniqueChaptersId = Array.from(new Set(chaptersId));

            const parts = await Part.find({
                chapter:{$in:uniqueChaptersId},
                status:1
            });
            const partsId = parts.map(part => part._id.toString())


            if(req.query.chapter) {
                const chapters = req.query.chapter.split(",");
                chaptersId = chapters.filter(chapter => chaptersId.includes(chapter));
                req.query.chapter = {$in:chaptersId}
            }else{
                req.query.chapter = {$in:uniqueChaptersId}
            }

            if(req.query.part) {
                const requestPart = req.query.part.split(",");
                const part =  requestPart.filter(p => partsId.includes(p))
                req.query.part = {$in:part}
            }else{
                req.query.part = {$in:partsId}
            }


            // status of data;
            req.query.status = 1;

            // sort data;
            let sort = {createdAt : -1}
            if(req.query.sortByDifficulty) {
                sort = {difficulty:req.query.sortByDifficulty}
                delete req.query.sortByDifficulty
            }
            if(req.query.sortByDegree) {
                sort = {difficulty:req.query.sortByDegree}
                delete req.query.sortByDegree
            }


            console.log(req.query);

            const data = await Questions.find(req.query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate("collage",{_id:1,name:1})
                    .populate("subject",{_id:1,name:1})
                    .populate("department",{_id:1,name:1})
                    .populate("division",{_id:1,name:1})
                    .populate("chapter",{_id:1,name:1})
                    .populate("part",{_id:1,name:1})


            for(let doc of data) {
                if(doc.image) doc.image = formatImageURL(req,doc.image);
            }


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            const data = new Questions(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });


router.route('/:id')
    .put(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            const data = await Questions.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            await Questions.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });


// make route to get all for admin;
router.get('/all', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {
        const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
        delete req.query.skip ;

        const data = await Questions.find(req.query)
            .sort({createdAt:-1})
            .limit(20)
            .skip(skip)
            .populate("collage",{_id:1,name:1})
            .populate("subject",{_id:1,name:1})
            .populate("department",{_id:1,name:1})
            .populate("division",{_id:1,name:1})
            .populate("chapter",{_id:1,name:1})
            .populate("part",{_id:1,name:1})

            res.json(data);

    } catch (error) {
        next(error);
    }
});

router.post('/:id', verifyAccessToken, async(req, res, next) => {
    try {
        const question = await Questions.findById(req.params.id);
        if(!question) throw createError.NotFound("Question not found");
        if(!question.nestedQuestions.length && typeof req.body.answer != 'number') throw createError.BadRequest("answer is required");
        if(question.nestedQuestions.length && !req.body.nestedAnswers) throw createError.BadRequest("nestedAnswers is required");

        let degree = 0;
        let answer = false;
        let nestedAnswers = [];
        let totalDegree = 0;
        if(question.correctAnswer != null) {
            totalDegree +=  question.degree
            answer = question.correctAnswer == req.body.answer
            if(answer) degree += question.degree;
        };

        if(question.nestedQuestions.length) {
            question.nestedQuestions.forEach((nestedQuestion, index) => {
                const correctAnswer = req.body.nestedAnswers[index] == nestedQuestion.correctAnswer
                nestedAnswers.push(correctAnswer)
                if(correctAnswer) degree += nestedQuestion.degree;
                totalDegree += nestedQuestion.degree;
            });
        }


        res.json({
            degree,
            answer,
            nestedAnswers,
            totalDegree
        })

    } catch (error) {
        next(error);
    }
})

module.exports = router;