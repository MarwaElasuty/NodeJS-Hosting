const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin } = require('../helpers/jwt');
const { formatImageURL } = require('../helpers/scripts');

const Fav = require('../models/fav');
const Course = require('../models/course');

router.route('/')
    .get(verifyAccessToken, async (req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
            delete req.query.skip;

            req.query.user = req.payload.userId;
            const data = await Fav.find(req.query)
                .sort({createdAt:-1})
                .skip(skip)
                .limit(20)
                .populate({
                    path:'course',
                    match:{status:{$ne:0}}
                });

            const courses = [];
            for(const doc of data) {
                doc._doc.course.inFav = true;
                doc._doc.course.cover = formatImageURL(req, doc._doc.course.cover);
                doc._doc.course.pdf = [];
                courses.push(doc._doc.course)
            }


            res.json(courses);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, async (req, res, next) => {
        try {
            if (!req.body.course) throw createError.BadRequest("Course is required")

            const isExist = await Fav.findOne({
                course: req.body.course,
                user:req.payload.userId
            });


            if (isExist) {
                await Fav.findByIdAndDelete(isExist._id);
                return res.json({status:200,process:true,message:"Removed"})
            }

            const data = new Fav({
                course: req.body.course,
                user: req.payload.userId
            });

            await data.save();
            return res.json({ status: 200, process: true,message:"Added successfully"})

        } catch (error) {
            next(error)
        }
    });

router.delete('/:id', verifyAccessToken, isAdmin, async (req, res, next) => {
    try {
        await Fav.findByIdAndDelete(req.params.id);
        res.json({status:200, message:"success"})
    } catch (error) {
        next(error)
    }
})



module.exports = router;