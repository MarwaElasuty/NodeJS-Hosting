const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAccessToken, isAdmin } = require('../helpers/jwt');
const createHttpError = require('http-errors');


const filter = (req, file, cb) => {
    const path = req.path.replace("s", "").slice(1);
    if (file.mimetype.includes(path)) {
        cb(null, true);
    } else {
        cb(createHttpError.BadRequest(`Only ${path} allow`), true);
    }
}

const option = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const path = req.path.replace("s", "");
            cb(null, `public${path}`)
        },
        filename: (req, file, cb) => {
            cb(null, `${new Date().getTime() + '_' + file.originalname}`)
        }
    }),
    fileFilter: filter
};





router.post('/image', verifyAccessToken, multer(option).single('image'), async(req, res, next) => {
    try {
        const image = `image/${req.file.filename}`;
        res.json({ image })
    } catch (error) {
        next(error);
    }
})


router.post('/pdf', verifyAccessToken, isAdmin, multer(option).single('pdf'), async(req, res, next) => {
    try {
        const pdf = `pdf/${req.file.filename}`;
        res.json({ pdf })
    } catch (error) {
        next(error);
    }
})

router.post('/video', verifyAccessToken, isAdmin, multer(option).single('video'), async(req, res, next) => {
    try {
        const video = `video/${req.file.filename}`;
        res.json({ video })
    } catch (error) {
        next(error);
    }
})

router.post('/images', verifyAccessToken, isAdmin, multer(option).array('image'), async(req, res, next) => {
    try {
        const images = req.files.map(file => "image/" + file.filename)
        res.json({ images })
    } catch (error) {
        next(error);
    }
})

router.post('/pdfs', verifyAccessToken, isAdmin, multer(option).array('pdf'), async(req, res, next) => {
    try {
        const pdf = req.files.map(file => 'pdf/' + file.filename)
        res.json({ pdf })
    } catch (error) {
        next(error);
    }
})

router.post('/videos', verifyAccessToken, isAdmin, multer(option).array('video'), async(req, res, next) => {
    try {
        const videos = req.files.map(file => "video/" + file.filename)
        res.json({ videos })
    } catch (error) {
        next(error);
    }
})



module.exports = router;