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

/*GET client/id_acc. */
router.get('/:id_acc/', function (req, res, next) {
    const id_acc = req.params.id_acc;
    try {
        res.json(client.getClientByIdAcc(id_acc));
    } catch (err) {
        console.error(`Нет клиента с таким ${id_acc}`, err.message);
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
