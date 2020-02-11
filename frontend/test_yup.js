const yup = require('yup');


const test = {name: 'teste', is_active: 'a'};

const schema = yup.object().shape({
    name: yup.string().required().max(255),
    is_active: yup.bool().required()
});


// schema.isValid(test).then(result => console.log(result));

schema.validate(test).then(result => console.log(result)).catch(errors => console.log(errors));