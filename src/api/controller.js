import axios from 'axios';
import { format } from 'date-fns';

const controller = axios.create({
    baseURl: 'http://81.200.31.254:33366',
    //baseURL: 'http://test.stella-npf.ru',
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json'
    },
    crossDomain: true,
    responseType: 'json'
});

const post = async (url, data) => await controller.post(url, data);
const get = async (url, data) => await controller.get(url, data);

class Controller {
    async getIdentInfo(identifier) {
        return get(`/json-iapi/iapi-client?act=getidentinfo&identifier=${identifier}`).then((response) => response.data);
    }

    async getGroupTypes() {
        return get('/json-iapi/iapi-instr?act=tgtypes').then((response) => response.data);
    }

    async getGroupsByType(typeId) {
        return get(`/json-iapi/iapi-instr?act=tginfo&id_tgroup=${typeId}`).then((response) => response.data);
    }

    async getGroupsByInstrId(instrId) {
        return get(`/json-iapi/iapi-instr?act=tglist&id_instr=${instrId}`).then((response) => response.data);
    }

    async getGroupCustomers(groupId, date) {
        const formattedDate = format(date, 'dd.MM.yyyy');
        return get(`/json-iapi/iapi-instr?act=tgclients&id_tgroup=${groupId}&date_on=${formattedDate}`).then((response) => response.data);
    }

    async getEmployees() {
        return get('/json-iapi/iapi-employee?act=getlist').then((response) => response.data);
    }

    async createVisit(clientId, operatorId, identifier, packageId, date) {
        console.log(`${clientId} ${operatorId} ${identifier} ${packageId} ${date}`);
        const formattedDate = formatDate(date);
        return get(
            `/json-iapi/iapi-instr?act=tgclientsp&identifier=${identifier}&operator=${operatorId}&time_motion=${formattedDate}&device_id=1022&id_sp=${packageId}`
        ).then((response) => response.data);
    }

    async getVisits(operatorId, date) {
        const formattedDate = formatDate(date);
        return get(`/json-iapi/iapi-instr?act=clientcode&operator=${operatorId}&time_motion=${formattedDate}&device_id=1022`).then(
            (response) => response.data
        );
    }

    async deleteVisit(id_sp, id_resolution) {
        console.log('api', id_sp, id_resolution);
        return get(`/json-iapi/iapi-instr/spmovedel?id_sp=${id_sp}&id_resolution=${id_resolution}`).then((response) => response.data);
    }

    async login(identifier) {
        return get(`/json-iapi/iapi-operator?act=login&identifier=${identifier}`).then((response) => response.data);
    }

    async getRentSalesReport(dateFrom, dateTo) {
        dateFrom = formatDate(dateFrom);
        dateTo = formatDate(dateTo);
        return get(`/json-iapi/report-slt-sales-arenda?DATE_FROM=${dateFrom}&DATE_TO=${dateTo}`).then((response) => response.data);
    }

    async getInstrSalesReport(dateFrom, dateTo, groupBy) {
        dateFrom = formatDate(dateFrom);
        dateTo = formatDate(dateTo);
        return get(`/json-iapi/report-slt-sales-instructors?DATE_FROM=${dateFrom}&DATE_TO=${dateTo}&GROUP_BY=${groupBy}`).then(
            (response) => response.data
        );
    }

    async moveClientInGroup(id_sp, id_group) {
        return get(`/json-iapi/iapi-instr?act=tgclientchg&id_desk=1001&id_emp=7&id_sp=${id_sp}&new_id_tg=${id_group}&force=1`).then(
            (response) => response.data
        );
    }

    async getProfiles() {
        return get(`/json-iapi/iapi-instr/getlist?id_profile=-1`).then((response) => response.data);
    }
}

//Тестовый вариант
// class Controller {
//     async getIdentInfo(identifier) {
//         return get(`/json-iapi/iapi-client/getidentinfo?identifier=${identifier}`).then((response) => response.data);
//     }
//
//     async getGroupTypes() {
//         return get('/json-iapi/iapi-instr/tgtypes').then((response) => response.data);
//     }
//
//     async getGroupsByType(typeId) {
//         return get(`/json-iapi/iapi-instr/tginfo?id_tgroup=${typeId}`).then((response) => response.data);
//     }
//
//     async getGroupsByInstrId(instrId) {
//         return get(`json-iapi/iapi-instr/tglist?id_instr=${instrId}`).then((response) => response.data);
//     }
//
//     async getGroupCustomers(groupId, date) {
//         const formattedDate = format(date, 'dd.MM.yyyy');
//         return get(`/json-iapi/iapi-instr/tgclients?id_tgroup=${groupId}&date_on=${formattedDate}`).then((response) => response.data);
//     }
//
//     async getEmployees() {
//         return get('/json-iapi/iapi-employee/getlist').then((response) => response.data);
//     }
//
//     async createVisit(clientId, operatorId, identifier, packageId, date) {
//         console.log(`${clientId} ${operatorId} ${identifier} ${packageId} ${date}`);
//         const formattedDate = formatDate(date);
//         return get(
//             `/json-iapi/iapi-instr/tgclientsp?identifier=${identifier}&operator=${operatorId}&time_motion=${formattedDate}&device_id=1022&id_sp=${packageId}`
//         ).then((response) => response.data);
//     }
//
//     async getVisits(operatorId, date) {
//         const formattedDate = formatDate(date);
//         return get(`/json-iapi/iapi-instr/clientcode?operator=${operatorId}&time_motion=${formattedDate}&device_id=1022`).then(
//             (response) => response.data
//         );
//     }
//
//     async deleteVisit(id_sp, id_resolution) {
//         console.log('api', id_sp, id_resolution);
//         return get(`/json-iapi/iapi-instr/spmovedel?id_sp=${id_sp}&id_resolution=${id_resolution}`).then((response) => response.data);
//     }
//
//     async login(identifier) {
//         return get(`/json-iapi/iapi-operator/login?identifier=${identifier}`).then((response) => response.data);
//     }
//
//     async getRentSalesReport(dateFrom, dateTo) {
//         dateFrom = formatDate(dateFrom);
//         dateTo = formatDate(dateTo);
//         return get(`/json-iapi/report-slt-sales-arenda?DATE_FROM=${dateFrom}&DATE_TO=${dateTo}`).then((response) => response.data);
//     }
//
//     async getInstrSalesReport(dateFrom, dateTo, groupBy) {
//         dateFrom = formatDate(dateFrom);
//         dateTo = formatDate(dateTo);
//         return get(`/json-iapi/report-slt-sales-instructors?DATE_FROM=${dateFrom}&DATE_TO=${dateTo}&GROUP_BY=${groupBy}`).then(
//             (response) => response.data
//         );
//     }
//
//     async moveClientInGroup(id_sp, id_group) {
//         console.log(id_sp, id_group);
//         return get(`/json-iapi/iapi-instr/tgclientchg?id_desk=1001&id_emp=7&id_sp=${id_sp}&new_id_tg=${id_group}&force=1`).then(
//             (response) => response.data
//         );
//     }
//     async getProfiles() {
//         return get(`/json-iapi/iapi-instr/getlist?id_profile=-1`).then((response) => response.data);
//     }
// }

function formatDate(date) {
    return encodeURIComponent(format(date, 'dd.MM.yyyy'));
}

export default new Controller();
