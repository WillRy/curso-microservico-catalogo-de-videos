const {createStore, applyMiddleware} = require("redux");

const {default: createDefaultMiddleware} = require('redux-saga');

const {take, put, call, actionChannel, debounce, select, all, fork} = require('redux-saga/effects');

const axios = require('axios');

function reducer(state, action) {
    if(action.type === 'acaoY'){
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

function* sagaNaoBloqueante() {
    console.log('antes do call');
    const {data} = yield call(() => axios.get('http://nginx/api/categories?search=a'));
    console.log('depois do call');
}

function* rootSaga() {
    yield all([
        debounceSearch(),
    ])
}

function* searchData(action) {

    console.log("===State Value===")
    console.log(yield select((state) => state.text));


    const search = action.value;

    try {
        const [response1,response2] = yield all([
            call(() => axios.get('http://nginx/api/videos?search='+search)),
            call(() => axios.get('http://nginx/api/categories?search='+search))
        ]);
        console.log("===Search result===")
        console.log(response1.data.data[0].title);
        console.log(response2.data.data[0].name);

        yield fork(sagaNaoBloqueante);
        console.log('depois do fork');

        yield put({
            type: 'acaoX',
            value: search
        });

    } catch (e) {
        console.log('error');
        yield put({
            type: 'acaoX',
            value: e
        });
    }
    console.log("===state===")
    console.log(store.getState());
}

const sagaMiddleware = createDefaultMiddleware();
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

const action = (type, value) => store.dispatch({type, value});


action('acaoY', 'a');

