const {createActions} = require("reduxsauce");

const {Types, Creators} = createActions({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload']
});

console.log(Creators.setSearch());
// console.log(Types);