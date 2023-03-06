const db = require('../services/db');
const config = require('../config');

function getMultiple(page = 1) {
    const offset = (page - 1) * config.listPerPage;
    const data = db.query(`SELECT * FROM Client LIMIT ?,?`, [offset, config.listPerPage]);
    const meta = { page };

    return {
        data,
        meta
    };
}

function validateCreate(client) {
    let messages = [];

    console.log(client);

    if (!client) {
        messages.push('No object is provided');
    }

    if (!client.fio) {
        messages.push('fio is empty');
    }

    if (!client.id_acc) {
        messages.push('id_acc is empty');
    }

    if (!client.mosreg) {
        messages.push('Mosreg is empty');
    }

    if (!client.certificateDate) {
        messages.push('CertificateDate is empty');
    }

    if (!client.contractDate) {
        messages.push('ContractDate is empty');
    }

    if (messages.length) {
        let error = new Error(messages.join());
        error.statusCode = 400;

        throw error;
    }
}

function create(clientObj) {
    validateCreate(clientObj);
    const { fio, id_acc, mosreg, certificateDate, contractDate } = clientObj;
    const result = db.run(
        'INSERT or REPLACE INTO Client (fio, id_acc, mosreg, certificateDate, contractDate) VALUES (@fio, @id_acc, @mosreg, @certificateDate, @contractDate)',
        { fio, id_acc, mosreg, certificateDate, contractDate }
    );

    let message = 'Error in creating client';
    if (result.changes) {
        message = 'Client created successfully';
    }

    return { message };
}

module.exports = {
    getMultiple,
    validateCreate,
    create
};
