import { LayoutFilled } from '@ant-design/icons';

const initItems = {
    items: [
        {
            id: 'group-dashboard',
            type: 'group',
            title: 'Меню',
            children: [
                {
                    title: 'Главная',
                    id: 'dashboard',
                    type: 'item',
                    url: '/',
                    icon: LayoutFilled,
                    breadcrumbs: false
                },
                {
                    title: 'Добавить клиента',
                    id: 'addClient',
                    type: 'item',
                    url: '/add-client',
                    icon: LayoutFilled,
                    breadcrumbs: false
                }
            ]
        }
    ]
};

function generateMenu() {
    const items = initItems;
    if (localStorage.getItem('identifier') === '97979797') {
        initItems.items.push({
            id: 'reports',
            type: 'group',
            title: 'Отчёты',
            children: [
                {
                    title: 'Продажи по аренде',
                    id: 'reports-rent',
                    url: '/reports/sales-rent',
                    icon: LayoutFilled,
                    breadcrumbs: true
                },
                {
                    title: 'Продажи тренеров',
                    id: 'reports-trainers',
                    url: '/reports/sales-trainers',
                    icon: LayoutFilled,
                    breadcrumbs: true
                }
            ]
        });
    }
    return items;
}

const menuItems = generateMenu();

export default menuItems;
