import axios from 'axios';
import { format } from 'date-fns';

const controller = axios.create({
    baseURL: 'http://92.63.100.34:3001',
    // baseURL: 'http://localhost:3001',
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
    async getGroupTypes() {
        return get('/group-types').then((response) => response.data);
    }

    async getGroupsByType(typeId) {
        return get(`/groups?typeId=${typeId}`).then((response) => response.data);
    }

    async getGroupsByInstrId(instrId) {
        return get(`/groups?instrId=${instrId}`).then((response) => response.data);
    }

    async getGroupCustomers(groupId, date) {
        const formattedDate = format(date, 'dd.MM.yyyy');
        return get(`/groups/${groupId}/customers?date=${formattedDate}`).then((response) => response.data);
    }

    async getEmployees() {
        return get('/employees').then((response) => response.data);
    }

    async createVisit(clientId, operatorId, identifier, packageId, date) {
        const formattedDate = formatDate(date);
        return post(
            `/visits?clientId=${clientId}&operatorId=${operatorId}&date=${formattedDate}&packageId=${packageId}&identifier=${identifier}`
        ).then((response) => response.data);
    }

    async getVisits(operatorId, date) {
        const formattedDate = formatDate(date);
        return get(`/visits?operatorId=${operatorId}&date=${formattedDate}`).then((response) => response.data);
    }

    async login(identifier) {
        return post(`/employees/login?identifier=${identifier}`).then((response) => response.data);
    }

    async getRentSalesReport(dateFrom, dateTo) {
        dateFrom = formatDate(dateFrom);
        dateTo = formatDate(dateTo);
        return get(`/reports/rent-sales?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((response) => response.data);
    }

    async getInstrSalesReport(dateFrom, dateTo, groupBy) {
        dateFrom = formatDate(dateFrom);
        dateTo = formatDate(dateTo);
        return get(`/reports/instr-sales?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=${groupBy}`).then((response) => response.data);
    }
}

function formatDate(date) {
    return encodeURIComponent(format(date, 'dd.MM.yyyy'));
}

export default new Controller();
