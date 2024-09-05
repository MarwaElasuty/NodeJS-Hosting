const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { verifyAccessToken, isAdmin, adminGuard } = require('../helpers/jwt');

const Division = require('../models/division');

router.route('/')
    .get(async(req, res, next) => {
        try {
            const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : -1
            delete req.query.skip;

            // check if admin 
            // const isAdmin = await adminGuard(req);
            // if (!isAdmin)  req.query.status = 1;
            req.query.status = 1

            if (req.query.searchText) {
                req.query.name = {
                    $regex: new RegExp(req.query.searchText, 'i')
                }
                delete req.query.searchText;
            }

            let sort = { name: 1 }
            if (req.query.sort) {
                sort = { sort: +req.query.sort }
                delete req.query.sort
            }

            let data = [];
            if (skip == -1) {
                data = await Division.find(req.query)
                    .sort(sort)
                    .populate("collage", { _id: 1, name: 1 })
            } else {
                data = await Division.find(req.query)
                    .sort(sort)
                    .skip(skip)
                    .limit(20)
                    .populate("collage", { _id: 1, name: 1 })
            }


            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = new Division(req.body);
            const saved = await data.save();
            res.json(saved)
        } catch (error) {
            next(error)
        }
    });

router.route('/:id')
    .put(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            const data = await Division.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(data);
        } catch (error) {
            next(error)
        }
    })
    .delete(verifyAccessToken, isAdmin, async(req, res, next) => {
        try {
            await Division.findByIdAndUpdate(req.params.id, { status: 0 }, { new: true });
            res.json({ status: 200, message: "success" })
        } catch (error) {
            next(error)
        }
    });




router.get('/admin', verifyAccessToken, isAdmin, async(req, res, next) => {
    try {
        const skip = +req.query.skip >= 0 ? +req.query.skip * 20 : -1
        delete req.query.skip;



        if (req.query.searchText) {
            req.query.name = {
                $regex: new RegExp(req.query.searchText, 'i')
            }
            delete req.query.searchText;
        }

        let sort = { name: 1 }
        if (req.query.sort) {
            sort = { sort: +req.query.sort }
            delete req.query.sort
        }

        let data = [];
        if (skip == -1) {
            data = await Division.find(req.query)
                .sort(sort)
                .populate("collage", { _id: 1, name: 1 })
        } else {
            data = await Division.find(req.query)
                .sort(sort)
                .skip(skip)
                .limit(20)
                .populate("collage", { _id: 1, name: 1 })
        }


        res.json(data);
    } catch (error) {
        next(error)
    }
});



module.exports = router;