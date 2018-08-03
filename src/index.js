import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import i18n from './i18n';

import App from './App';
import NodeIndex from './node-index';
import registerServiceWorker from './registerServiceWorker';
import ta98Data from './human.json';


ReactDOM.render(<App 
                   ta98Data={new NodeIndex(ta98Data)}
                />, 
                document.getElementById('root'));
registerServiceWorker();
