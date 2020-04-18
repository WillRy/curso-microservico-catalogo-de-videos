const {createStore, applyMiddleware} = require("redux");

const {default: createDefaultMiddleware} = require('redux-saga');

const {take, put, call, actionChannel, debounce, select} = require('redux-saga/effects');

const axios = require('axios');

function reducer(state, action) {
    if(action.type === 'acaoY'){
        console.log('acaoY - reducer');
        return {...state, text: action.value}
    }
    if (action.type === 'acaoX') {
        return {value: action.value}
    }
}

/** Debounce já mantem uma execução infinita */
function* debounceSearch() {
    yield debounce(1000, 'acaoY', searchData);
}

function* searchData(action) {

        console.log("===State Value===")
        console.log(yield select((state) => state.text));
        console.log("===start search method===");

        const search = action.value;

        try {
            const {data} = yield call(() => axios.get('http://nginx/api/videos?search='+search));

            yield put({
                type: 'acaoX',
                value: search
            });

        } catch (e) {
            yield put({
                type: 'acaoX',
                value: e
            });
        }

    console.log(store.getState());
}

const sagaMiddleware = createDefaultMiddleware();
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(debounceSearch);

const action = (type, value) => store.dispatch({type, value});


action('acaoY', 'w');
action('acaoY', 'wi');
action('acaoY', 'wil');
action('acaoY', 'william');
action('acaoY', 'william M');


