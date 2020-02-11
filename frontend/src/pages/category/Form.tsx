import * as React from 'react';
import {Checkbox, TextField} from "@material-ui/core";
import { useForm } from 'react-hook-form';
import categoryHttp from "../../util/http/category-http";
import * as yup from '../../util/vendor/yup';
import {useEffect, useState} from "react";
import {useParams} from 'react-router';
import Category from "../../util/models";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useHistory } from 'react-router-dom';
import {useSnackbar} from "notistack";
import SubmitButtons from "../../components/SubmitButtons";



const validationSchema = yup.object().shape({
    name: yup.string().label('nome').required().max(255)
});

export const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        errors,
        reset,
        watch,
        setValue,
        triggerValidation
    } = useForm({
        defaultValues: {
            is_active: true
        },
        validationSchema
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [category, setCategory] = useState<Category| null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        register({name: 'is_active'});
    }, [register]);



    useEffect(() => {

        if(!id){
            return;
        }

        async function getCategory(){
            setLoading(true);
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            }catch (e) {
                console.log(e);
                snackbar.enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
            } finally {
                setLoading(false)
            }
        }

        getCategory();

    }, [id, reset, snackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category ? categoryHttp.create(formData) : categoryHttp.update(category.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Categoria salva com sucesso!', {variant: "success"});
            setLoading(false);
            event
                ? (
                    id
                        ? history.replace(`/categories/${data.data.id}/edit`)
                        : history.push(`/categories/${data.data.id}/edit`)
                )
                : history.push('/categories');
        } catch (e) {
            console.log(e);
            snackbar.enqueueSnackbar('Não foi possível salvar a categoria!', {variant: "error"});
            setLoading(false)
        }
    }

    function validateSubmit(){
        triggerValidation()
            .then(isValid => {isValid && onSubmit(getValues(), null)});
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error = {(errors as any).name !== undefined}
                helperText={(errors as any).name && (errors as any).name.message}
                InputLabelProps={{shrink: true}}
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
                disabled={loading}
                InputLabelProps={{shrink: true}}

            />

            <FormControlLabel
                control=
                    {<Checkbox
                        name="is_active"
                        color={"primary"}
                        onChange={() => setValue('is_active', !getValues()['is_active'])}
                        checked={(watch('is_active') as boolean)}
                    />
                    }
                label={"Ativo?"}
                labelPlacement={"end"}
                disabled={loading as boolean}/>

            <SubmitButtons disabledButtons={loading} handleSave={validateSubmit}/>

        </form>
    );
};