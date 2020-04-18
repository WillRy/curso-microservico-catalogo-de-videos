const {createStore, applyMiddleware} = require("redux");

function reducer(state, action) {
    return {value: action.value}
}

const customMiddleware = store => next => action => {
    console.log('hello');
    next(action);
};

const store = createStore(reducer, applyMiddleware(customMiddleware));


const action = (type, value) => store.dispatch({type, value});

action("ADD", '1');

console.log(store.getState());
