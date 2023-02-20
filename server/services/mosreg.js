const db = require('../services/db');
const config = require('../config');

function getMultiple(page = 1) {
    const offset = (page - 1) * config.listPerPage;
    const data = db.query(`SELECT * FROM MOSREG LIMIT ?,?`, [offset, config.listPerPage]);
    const meta = { page };

    return {
        data,
        meta
    };
}

function validateCreate(mosreg) {
    let messages = [];

    console.log(mosreg);

    if (!mosreg) {
        messages.push('No object is provided');
    }

    if (!mosreg.id_acc) {
        messages.push('id_acc is empty');
    }

    if (!mosreg.mosreg) {
        messages.push('Mosreg is empty');
    }

    if (messages.length) {
        let error = new Error(messages.join());
        error.statusCode = 400;

        throw error;
    }
}

function create(mosregObj) {
    validateCreate(mosregObj);
    const { id_acc, mosreg } = mosregObj;
    const result = db.run('INSERT or REPLACE INTO mosreg (id_acc, mosreg) VALUES (@id_acc, @mosreg)', { id_acc, mosreg });

    let message = 'Error in creating mosreg';
    if (result.changes) {
        message = 'Mosreg created successfully';
    }

    return { message };
}

module.exports = {
    getMultiple,
    validateCreate,
    create
};
