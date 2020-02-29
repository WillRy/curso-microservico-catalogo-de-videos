const yup = require('yup');

//
// const test = {name: 'teste', is_active: 'a'};
//
// const schema = yup.object().shape({
//     name: yup.string().required().max(255),
//     is_active: yup.bool().required()
// });
//

// schema.isValid(test).then(result => console.log(result));

// schema.validate(test).then(result => console.log(result)).catch(errors => console.log(errors));

const columnsDefinitions = [
    {
        name: "id",
        label: "ID",
        width: '30%',

    },
    {
        name: "name",
        label: "Nome",
        width: '43%'
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: '4%'
    },
    {
        name: "created_at",
        label: "Criado em",
        width: '10%'
    },
    {
        name: 'actions',
        label: "Ações",
        width: '13%'
    }
];


const schema  = yup.object().shape({
    search: yup.string().transform(value => !value ? undefined : value).default(''),
    pagination: yup.object().shape({
        page: yup.number()
            .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
            .default(1),
        per_page: yup.number()
            .oneOf([10,15,100])
            .transform(value => isNaN(value) ? undefined : value)
            .default(15),
    }),
    order: yup.object().shape({
        sort: yup.string()
            .nullable()
            .transform(value => {
                const columnsName = columnsDefinitions
                    .filter(column => !column.options || !column.options.sort !== false)
                    .map(column => column.name);

                return columnsName.includes(value) ? value : undefined
            })
            .default(null),
        dir: yup.string()
            .nullable()
            .transform(value => {
                return !value || ['asc', 'desc'].includes(value.toLowerCase() ? undefined : value);
            })
            .default(null),
    })
});

console.log(schema.cast({}));