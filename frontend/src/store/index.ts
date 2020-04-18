import {applyMiddleware, createStore} from "redux";
import createSagaMiddleware from 'redux-saga';
import reducer from "./upload";
import rootSaga from "./root-saga";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
