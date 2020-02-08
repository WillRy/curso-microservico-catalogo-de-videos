import {LocaleObject, setLocale} from 'yup'

const ptBr: LocaleObject = {
    mixed: {
        // eslint-disable-next-line no-template-curly-in-string
        required: '${path} é requerido'
    },
    string: {
        // eslint-disable-next-line no-template-curly-in-string
        max: '${path} precisa ter no máximo ${max} caracteres'
    },
    number: {
        // eslint-disable-next-line no-template-curly-in-string
        min: '${path} precisa ser no mínimo ${min}'
    }
};

setLocale(ptBr);

export * from 'yup';

