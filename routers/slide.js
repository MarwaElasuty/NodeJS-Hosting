const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Slide = require('../models/slide');
const { formatImageURL } = require('../helpers/scripts');

router.route('/')
    .get(verifyAccessToken, async(req, res, next) => {
        try {

            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : -1
            delete req.query.skip;

            // check if admin 
            const isAdmin = await adminGuard(req);
            if (!isAdmin) req.query.status = 1;




            let sort = { createdAt: -1 }
            if (req.query.sort) {
                sort = { sort: +req.query.sort }
                delete req.query.sort
            }



            let data = [];
            if (skip == -1) {
                data = await Slide.find(req.query)
                    .sort(sort);
            } else {
                data = await Slide.find(req.query)
                    .sort(sort)
                    .skip(skip)
                    .limit(20)
            }


            for (let doc of data) {
                doc.image = formatImageURL(req, doc.image);
            }

            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = new Slide(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });

router.route('/:id')
    .put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            await Slide.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });

router.get('/count', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {
        const Slide = await Slide.count(req.query)
        res.json({ count: Slide });
    } catch (error) {
        next(error)
    }
});



module.exports = router;