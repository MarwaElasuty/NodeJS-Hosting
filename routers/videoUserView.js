const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard} = require('../helpers/jwt');
const { formatImageURL } = require('../helpers/scripts');

const VideoUserView = require('../models/videoUserView');

router.post('/', verifyAccessToken, async(req, res, next) => {
    try {

        const admin = await adminGuard(req);
        if(!admin) {
            req.query.user = req.payload.userId
        }

        const data = await VideoUserView.find(req.query)
            .sort({ createdAt: -1 })

        res.json(data);
    } catch (error) {
        next(error)
    }
});
router.post("/", verifyAccessToken, async(req, res, next) => {
    try {
        if (!req.body.video) throw createError.BadRequest("video is required")

        const isExist = await VideoUserView.findOne({
            video: req.body.video,
            user:req.payload.userId
        });


        if (isExist) {
            const views = await VideoUserView.findByIdAndUpdate(isExist._id, { views: isExist.views + 1 }, { new: true });
            return res.json(views)
        }

        const data = new VideoUserView({
            video: req.body.video,
            user:req.payload.userId,
            views: 1
        });

        await data.save();
        return res.json(data)

    } catch (error) {
        next(error)
    }
});



module.exports = router;