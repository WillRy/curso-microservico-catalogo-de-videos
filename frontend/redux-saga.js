const {createStore, applyMiddleware} = require("redux");

const {default: createDefaultMiddleware} = require('redux-saga');

const {take, put} = require('redux-saga/effects');

function reducer(state, action) {
    if (action.type === 'acaoX') {
        return {value: action.value}
    }
}

function* helloWorld() {
    console.log("hello");
    const action = yield take('acaoY');

    yield put({
        type: 'acaoX',
        value: 'novo valor'
    });

}

const sagaMiddleware = createDefaultMiddleware();
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(helloWorld);

const action = (type, value) => store.dispatch({type, value});

action('acaoY', 'a');

console.log(store.getState());
