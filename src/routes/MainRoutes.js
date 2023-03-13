import { lazy } from 'react';
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import GroupList from '../pages/groups/GroupList';
import GroupClients from '../pages/groups/GroupClients';
import InstrReport from '../pages/reports/InstrReport';
import RentReport from '../pages/reports/RentReport';
import AddClient from '../pages/groups/AddClient';
import ClientDetail from '../pages/groups/ClientDetail';
import SeasonTickets from '../pages/groups/SeasonTickets';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/SamplePage')));

const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <DashboardDefault />
        },
        {
            path: '/add-client',
            element: <AddClient />
        },
        {
            path: '/groups/:typeId',
            element: <GroupList />
        },
        {
            path: '/instr-group',
            element: <GroupList />
        },
        {
            path: '/group-clients/:id',
            element: <GroupClients />
        },
        {
            path: '/reports/sales-trainers',
            element: <InstrReport />
        },
        {
            path: '/reports/sales-rent',
            element: <RentReport />
        },
        {
            path: '/client-detail/:id_acc',
            element: <ClientDetail />
        },
        {
            path: '/season-tickets',
            element: <SeasonTickets />
        },
        {
            path: 'dashboard',
            children: [
                {
                    path: 'default',
                    element: <DashboardDefault />
                }
            ]
        }
    ]
};

export default MainRoutes;
