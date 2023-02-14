import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import 'simplebar/src/simplebar.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'assets/third-party/apex-chart.css';
import App from './App';
import { store } from 'store';
import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
setDefaultOptions({ locale: ru });

root.render(
    // <StrictMode>
    <ReduxProvider store={store}>
        <HashRouter>
            <App />
        </HashRouter>
    </ReduxProvider>
    // </StrictMode>
);
