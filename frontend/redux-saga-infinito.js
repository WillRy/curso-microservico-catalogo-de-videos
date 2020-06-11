const {createStore, applyMiddleware} = require("redux");

const {default: createDefaultMiddleware} = require('redux-saga');

const {take, put, call, actionChannel} = require('redux-saga/effects');

const axios = require('axios');

function reducer(state, action) {
    if (action.type === 'acaoX') {
        return {value: action.value}
    }
}

function* helloWorld() {
    console.log("hello");
    const action = yield actionChannel('acaoY');
    while (true) {
        console.log("antes da ação Y");
        const action = yield take('acaoY');
        const search = action.value;
        const {data} = yield call(() => axios.get('http://nginx/api/videos?search=a'));
        console.log(data.data[0].title);

        //logica ---


        const value = 'novo valor' + (Math.random());
        console.log(value);
        yield put({
            type: 'acaoX',
            value: value
        });
        console.log(store.getState());
    }
}

const sagaMiddleware = createDefaultMiddleware();
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(helloWorld);

const action = (type, value) => store.dispatch({type, value});


action('acaoY', 'b');
action('acaoY', 'b');
