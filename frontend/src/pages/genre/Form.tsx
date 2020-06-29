import * as React from 'react';
import {TextField} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import {useEffect, useState} from "react";
import categoryHttp from "../../util/http/category-http";
import {useForm} from "react-hook-form";
import genreHttp from "../../util/http/genres-http";
import {Category, simpleResponse} from "../../util/models";
import {useParams} from 'react-router';
import { useHistory } from 'react-router-dom';
import {useSnackbar} from "notistack";
import {Genre} from "../../util/models";
import * as yup from '../../util/vendor/yup';
import SubmitActions from "../../components/SubmitActions";
import {useContext} from "react";
import LoadingContext from "../../components/Loading/LoadingContext";

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    categories_id: yup.array().label("Categorias").required()
});

const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        reset,
        errors,
        triggerValidation
    } = useForm<{name, categories_id}>({
        defaultValues: {
            categories_id: []
        },
        validationSchema
    });

    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [categories, setCategories] = useState<Category[]>( []);
    const [genre, setGenre] = useState<Genre | null>( null);
    const loading = useContext(LoadingContext);

    useEffect(() => {
        register({
            name: 'categories_id'
        });
    }, [register]);

    useEffect(() => {

        let isSubscribed = true;

        (async () => {

            const promises = [categoryHttp.list({queryParams: {all: ''}})];

            if(id){
                promises.push(genreHttp.get(id));
            }

            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);

                if(isSubscribed){
                    setCategories(categoriesResponse.data.data);

                    if(id) {
                        setGenre(genreResponse.data.data);
                        const categories_id = genreResponse.data.data.categories.map(category => category.id);
                        reset( {
                            ...genreResponse.data.data,
                            categories_id
                        });
                    }
                }

            } catch (e) {
                console.log(e);
                enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
            }
        })();


        return () => { isSubscribed = false }

    }, [id, reset, enqueueSnackbar]);


    const  handleCategoriesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setValue('categories_id', event.target.value as Array<any>);
    };

    async function onSubmit(formData, event)  {

        try {
            const http = !genre
                ? genreHttp.create<simpleResponse<Genre>>(formData)
                : genreHttp.update<simpleResponse<Genre>>(genre.id, formData);

            const {data} = await http;
            enqueueSnackbar("Gênero salvo com sucesso!", {variant:"success"});

            event
                ? (
                    id
                        ? history.replace(`/genres/${data.data.id}/edit`)
                        : history.push(`/genres/${data.data.id}/edit`)
                )
                : history.push('/genres');
        } catch (e) {
            console.log(e);
            enqueueSnackbar("Não foi possível salvar o gênero", {variant:"error"});
        }

    }

    function validateSubmit(){
        triggerValidation()
            .then(isValid => {isValid && onSubmit(getValues(), null)});
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

            <SubmitActions disabledButtons={loading} handleSave={validateSubmit}/>
        </form>
    );
};

export default Form;