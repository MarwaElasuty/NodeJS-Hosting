const router = require("express").Router();
const createError = require('http-errors');
const Privacy = require('../models/privacy');
const axios = require("axios");
const { verifyAccessToken, isAdmin } = require("../helpers/jwt");

router.route('/')
    .get(async (req, res, next) => {
        try {
            const data = await Privacy.findOne();
            if(!data) throw createError.NotFound("Link not Exist")
            const a = await axios.get(data.link);
            res.json(a.data);
        } catch (error) {
            next(error)
        }
    })
    .post(verifyAccessToken, isAdmin ,async (req, res, next) => {
        try {
            const data = await Privacy.findOne();
            if(data) {
                const updatedData = await Privacy.findByIdAndUpdate(data._id,req.body, {new: true});
                return res.json(updatedData)
            }

            const uploadedData = new Privacy(req.body);
            const saved = await uploadedData.save();
            res.json(saved);

        } catch (error) {
            next(error)
        }
    })


module.exports = router;