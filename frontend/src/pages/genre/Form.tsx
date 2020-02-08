import * as React from 'react';
import {TextField} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import {useEffect, useState} from "react";
import categoryHttp from "../../util/http/category-http";
import {useForm} from "react-hook-form";
import genreHttp from "../../util/http/genres-http";
import Category from "../../util/models";
import {useParams} from 'react-router';
import { useHistory } from 'react-router-dom';
import {useSnackbar} from "notistack";
import Genre from "../../util/models";
import * as yup from '../../util/vendor/yup';
import SubmitButtons from "../../components/SubmitButtons";



const validationSchema = yup.object().shape({
    name: yup.string().label('nome').required().max(255),
    categories_id: yup.array().required().label("categorias")
});


const Form = () => {

    const {register, handleSubmit, getValues, setValue , watch, reset, errors, triggerValidation} = useForm({
        defaultValues: {
            categories_id: []
        },
        validationSchema
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [categories, setCategories] = useState<Category[]>( []);
    const [genre, setGenre] = useState<Genre | null>( null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        register({
            name: 'categories_id'
        });
    }, [register]);

    useEffect(() => {
        setLoading(true);
        categoryHttp.list().then(response => setCategories(response.data.data)).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if(!id){
            return;
        }

        setLoading(true);
        genreHttp.get(id).then(({data}) => {
            setGenre(data.data);
            const categories = data.data.categories.map(category => category.id);
            reset({...data.data, categories_id: categories });
        }).finally(() => setLoading(false));
    }, []);


    const  handleCategoriesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setValue('categories_id', event.target.value as Array<any>);
    };

    const onSubmit = (formData, event) => {
        setLoading(true);

        const http = !genre ? genreHttp.create(formData) : genreHttp.update(genre.id, formData);

        http.then(({data}) => {
            snackbar.enqueueSnackbar("Gênero salvo com sucesso!", {variant:"success"});
            setLoading(false);

            event
                ? (
                    id
                        ? history.replace(`/genres/${data.data.id}/edit`)
                        : history.push(`/genres/${data.data.id}/edit`)
                )
                : history.push('/genres');

        }).catch(error => {
            console.log(error);
            snackbar.enqueueSnackbar("Não foi possível salvar o gênero", {variant:"error"});
            setLoading(false);
        });

    };

    function validateSubmit(){
        triggerValidation()
            .then(isValid => isValid && onSubmit(getValues(), null));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name={"name"}
                label={"Nome"}
                variant={"outlined"}
                fullWidth
                inputRef={register}
                disabled={loading}
                InputLabelProps={{shrink: true}}
                error={(errors as any).name !== undefined}
                helperText={(errors as any).name && (errors as any).name.message}

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
                disabled={loading}
                error={(errors as any).categories_id !== undefined}
                helperText={(errors as any).categories_id && (errors as any).categories_id.message}
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

            <SubmitButtons disabledButtons={loading} handleSave={validateSubmit}/>
        </form>
    );
};

export default Form;