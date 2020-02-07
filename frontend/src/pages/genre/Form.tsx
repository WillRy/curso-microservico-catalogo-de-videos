import * as React from 'react';
import {ButtonProps, TextField, Theme} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import {useEffect, useState} from "react";
import categoryHttp from "../../util/http/category-http";
import {useForm} from "react-hook-form";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import genreHttp from "../../util/http/genres-http";
import Category from "../../util/models";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});


const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: 'contained'
    };

    const [categories, setCategories] = useState<Category[]>( []);

    const {register, handleSubmit,getValues, setValue , watch} = useForm({
        defaultValues: {
            categories_id: []
        }
    });

    useEffect(() => {
        register({
            name: 'categories_id'
        });
    }, [register]);

    useEffect(() => {
        categoryHttp.list().then(response => setCategories(response.data.data));
    }, []);

    const  handleCategoriesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setValue('categories_id', event.target.value as Array<any>);
    };

    const onSubmit = (formData, event) => {
        genreHttp.create(formData).then(response => console.log(response.data.data));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name={"name"}
                label={"Nome"}
                variant={"outlined"}
                fullWidth
                inputRef={register}
            />

            <TextField
                select
                name={"categories_id"}
                value={watch('categories_id')}
                label={"Categorias"}
                variant={"outlined"}
                margin={"normal"}
                fullWidth
                onChange={handleCategoriesChange}
                SelectProps={{
                    multiple: true
                }}
                InputLabelProps={{shrink:true}}

            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                <hr/>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }

            </TextField>
            <Box dir={"rtl"}>
                <Button {...buttonProps} type="button" onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;