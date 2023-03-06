const express = require('express');
const router = express.Router();
const client = require('../services/Client');

/* GET client listing. */
router.get('/', function (req, res, next) {
    try {
        res.json(client.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting Client `, err.message);
        next(err);
    }
});

// POST client listing
router.post('/', function (req, res, next) {
    try {
        res.json(client.create(req.body));
    } catch (err) {
        console.error(`Error while adding mosreg `, err.message);
        next(err);
    }
});

module.exports = router;
