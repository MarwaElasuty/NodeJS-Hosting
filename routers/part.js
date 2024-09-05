const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Part = require('../models/part');
const Chapter = require('../models/chapter');
const Course = require('../models/course')
const Subscription = require('../models/subscription');
const { formatImageURL } = require('../helpers/scripts');

router.route('/')
    .get(verifyAccessToken, isAdmin, async (req, res, next) => {
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

            let sort = {name : 1}
            if(req.query.sort) {
                sort = {sort: +req.query.sort}
                delete req.query.sort
            }
            

            const data = await Part.find(req.query)
                    .sort(sort)
                    .skip(skip)
                    .limit(20)
                    .populate("collage",{_id:1,name:1})
                    .populate("subject",{_id:1,name:1})
                    .populate("department",{_id:1,name:1})
                    .populate("division",{_id:1,name:1})
                    .populate("chapter",{_id:1,name:1})
        

            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            const data = new Part(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });


router.route('/:id')
    .put(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            const data = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async (req, res, next) => {
        try {
            await Part.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });

// get Parts by chapter id 
router.get('/chapter/:id', verifyAccessToken, async (req, res, next) => {
    try {

        const chapter = await Chapter.findById(req.params.id);
        if(!chapter || !chapter.status) throw createError.MethodNotAllowed("You are not allow to get this chapter");

        

        // get Subscriptions data;
        const subscriptions = await Subscription.find({
            user:req.payload.userId,
            status:1
        });

        if(!subscriptions.length) throw createError.MethodNotAllowed("You are not allow to get this chapter");


        const coursesId = subscriptions.map(sub => sub.course)
        const course = await Course.find({
            _id:{$in:coursesId},
            chapters:req.params.id,
            status:1
        });

        if(!course.length) throw createError.MethodNotAllowed("You are not allow to get this chapter");


        const parts = await Part.find({chapter:req.params.id, status :1})
            .sort({name:1})
            .populate("collage",{_id:1,name:1})
            .populate("subject",{_id:1,name:1})
            .populate("department",{_id:1,name:1})
            .populate("division",{_id:1,name:1})
            .populate("chapter",{_id:1,name:1})

            for(let part of parts) {
                if(part.videos.length) part.videos = part.videos.map(video => formatImageURL(req, video))
                if(part.pdf.length) part.pdf = part.pdf.map(pdf => formatImageURL(req, pdf))
            }

            res.json(parts);

    } catch (error) {
        next(error);
    }
})


// collection for questions 
// collection for quiz


module.exports = router;