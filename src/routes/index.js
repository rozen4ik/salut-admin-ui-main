import { useRoutes } from 'react-router-dom';

import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';
import PdfRoutes from './PdfRoutes';

export default function ThemeRoutes() {
    return useRoutes([MainRoutes, LoginRoutes, PdfRoutes]);
}
