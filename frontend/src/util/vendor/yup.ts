/* eslint-disable no-template-curly-in-string */
import {LocaleObject, setLocale} from 'yup'

const ptBr: LocaleObject = {
    mixed: {
        required: '${path} é requerido',
        notType: '${path} é invalido',
    },
    string: {
        max: '${path} precisa ter no máximo ${max} caracteres'
    },
    number: {
        min: '${path} precisa ser no mínimo ${min}'
    }
};

setLocale(ptBr);

export * from 'yup';

