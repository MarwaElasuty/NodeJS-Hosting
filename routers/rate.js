const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');
const { formatImageURL, getTotalRating } = require('../helpers/scripts');

const Rate = require('../models/rate');
const Course = require('../models/course')


router.route('/')
    .get(verifyAccessToken, async (req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : 0
            delete req.query.skip;

            // check if admin 
            const isAdmin = await adminGuard(req);
            if (!isAdmin) {
                req.query.status = 1;
                // req.query.user = req.payload.userId
            }


            const data = await Rate.find(req.query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(20)
                .populate("user", {password:0})


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, async (req, res, next) => {
        try {
            const existCourse = await Course.findById(req.body.course);
            if (!existCourse) throw createError.NotFound("Course not found")
            delete req.body.status;
            req.body.user = req.payload.userId;
            const data = new Rate(req.body);
            const saved = await data.save();

            // update course with every rate request;
            const rating = await getTotalRating(existCourse._id);
            await Course.findByIdAndUpdate(req.body.course,rating)

            res.json(saved)
        } catch (error) {
            next(error)
        }
    });

router.route('/:id')
    .put(verifyAccessToken, async (req, res, next) => {
        try {
            const oldData = await Rate.findById(req.params.id);
            if (!oldData || !oldData.status) throw createError.NotFound("لا يوجد بيانات")
            
            // check if is Admin or owner user ;
            const isAdmin = await adminGuard(req);
            if (!isAdmin && oldData.user.toString() != req.payload.userId) throw createError.Forbidden("لا يمكنك تعديل هذا التقييم");
            
            delete req.body.course

            const data = await Rate.findByIdAndUpdate(req.params.id, req.body, { new: true });

            // update course with every rate request;
            const rating = await getTotalRating(oldData.course);
            await Course.findByIdAndUpdate(oldData.course,rating)

            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, async (req, res, next) => {
        try {
            const oldData = await Rate.findById(req.params.id);
            if (!oldData || !oldData.status) throw createError.NotFound("لا يوجد بيانات")

            // check if is Admin or owner user ;
            const isAdmin = await adminGuard(req);
            if (!isAdmin && oldData.user.toString() != req.payload.userId) throw createError.Forbidden("You are not allow");

            await Rate.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });

            const rating = await getTotalRating(oldData.course);
            await Course.findByIdAndUpdate(oldData.course,rating)

            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    })



module.exports = router;