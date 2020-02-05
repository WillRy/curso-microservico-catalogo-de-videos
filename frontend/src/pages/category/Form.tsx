import * as React from 'react';
import {Button, ButtonProps, TextField, Theme} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useForm } from 'react-hook-form';
import categoryHttp from "../../util/http/category-http";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});
export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: 'outlined',
        className: classes.submit
    };

    const {register, handleSubmit, getValues} = useForm({
        defaultValues: {
            is_active: true
        }
    });

    function onSubmit(formData, event) {
        categoryHttp.create(formData).then(response => console.log(response.data.data));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
            />
            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin="normal"
                inputRef={register}
            />

            <Checkbox
                name="is_active"
                defaultChecked
                inputRef={register}
            />
            Ativo?

            <Box dir="rtl">
                <Button {...buttonProps} type="button" onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};