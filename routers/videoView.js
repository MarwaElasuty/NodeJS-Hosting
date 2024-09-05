const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin } = require('../helpers/jwt');
const { formatImageURL } = require('../helpers/scripts');

const VideoView = require('../models/videoView');

router.post('/get', verifyAccessToken, async(req, res, next) => {
    try {
        req.query.video = { $in: req.body.videos }
        const data = await VideoView.find(req.query)
            .sort({ createdAt: -1 })

        res.json(data);
    } catch (error) {
        next(error)
    }
});
router.post("/view", verifyAccessToken, async(req, res, next) => {
    try {
        if (!req.body.video) throw createError.BadRequest("video is required")

        const isExist = await VideoView.findOne({
            video: req.body.video,
        });


        if (isExist) {
            const views = await VideoView.findByIdAndUpdate(isExist._id, { views: isExist.views + 1 }, { new: true });
            return res.json(views)
        }

        const data = new VideoView({
            video: req.body.video,
            views: 1
        });

        await data.save();
        return res.json(data)

    } catch (error) {
        next(error)
    }
});



module.exports = router;