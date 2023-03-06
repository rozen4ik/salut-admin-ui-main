import axios from 'axios';
import { format } from 'date-fns';

const controller = axios.create({
    baseURL: 'http://localhost:7000/',
    // baseURL: 'http://localhost:3001',
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json'
    },
    crossDomain: true,
    responseType: 'json'
});

const post = async (url, data) => await controller.post(url, data);
const get = async (url) => await controller.get(url);

class ExpressController {
    async getClient() {
        return get('/Client').then((response) => response.data);
    }
    async postClient(dictMosReg) {
        return post('/Client', `${dictMosReg}`)
            .then((response) => response.data)
            .catch(console.log('ошибка'));
    }
}

export default new ExpressController();
