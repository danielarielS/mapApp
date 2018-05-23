import React from 'react';
import ReactDOM from 'react-dom';
import { Welcome , Logo , Login} from './welcome';
import App from './app';


import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise';
import reducer from './reducers';

import { composeWithDevTools } from 'redux-devtools-extension';

import { init as initSocket } from './socket';

// document.eventListener('dblclick')
const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

const elem = (
    <Provider store={store}>
        <App />
    </Provider>
);

if (location.pathname == '/welcome'){
    ReactDOM.render( <Welcome/>, document.querySelector('main') );
}else {
    ReactDOM.render(elem, document.querySelector('main') );
    initSocket(store);
}
