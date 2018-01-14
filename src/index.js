import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import NodeIndex from './NodeIndex';
import registerServiceWorker from './registerServiceWorker';
import ta98Data from './human.json';
import wpImageIndex from './wikipedia-images.json';



ReactDOM.render(<App 
                   ta98Data={new NodeIndex(ta98Data)}
                   wpImageIndex={wpImageIndex}/>, 
                document.getElementById('root'));
registerServiceWorker();
