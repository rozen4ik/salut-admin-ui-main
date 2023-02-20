const express = require('express');
const router = express.Router();
const mosreg = require('../services/mosreg');

/* GET mosreg listing. */
router.get('/', function (req, res, next) {
    try {
        res.json(mosreg.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting mosreg `, err.message);
        next(err);
    }
});

// POST mosreg listing
router.post('/', function (req, res, next) {
    try {
        res.json(mosreg.create(req.body));
    } catch (err) {
        console.error(`Error while adding mosreg `, err.message);
        next(err);
    }
});

module.exports = router;
