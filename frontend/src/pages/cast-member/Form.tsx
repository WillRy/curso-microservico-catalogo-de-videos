import * as React from 'react';
import {TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {useForm} from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import {useEffect, useState} from "react";
import * as yup from '../../util/vendor/yup';
import { useHistory } from 'react-router-dom';
import {useSnackbar} from "notistack";
import {useParams} from 'react-router';
import CastMember from "../../util/models";
import FormHelperText from "@material-ui/core/FormHelperText";
import SubmitButtons from "../../components/SubmitButtons";



const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    type: yup.number().label('Tipo').required()
});

export const Form = () => {


    const {register, handleSubmit, getValues, setValue, watch, reset, errors, triggerValidation} = useForm({
        validationSchema
    });

    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [castMember, setCastMember] = useState<CastMember | null>(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        register( {name: "type"});
    }, [register]);

    useEffect(() => {

        if(!id){
            return;
        }

        (async function getCastMember() {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.get(id);
                setCastMember(data.data);
                reset(data.data);
                setLoading(false);

            } catch (e) {
                console.log(e);
                enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});

            } finally {
                setLoading(false);
            }
        })();


    }, [id, reset, enqueueSnackbar]);



    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !castMember ? castMemberHttp.create(formData) : castMemberHttp.update(castMember.id, formData);
            const {data} = await http;
            enqueueSnackbar("Membro de elenco salvo com sucesso!", {variant: "success"});
            setLoading(false);
            event
                ?
                (
                    id
                        ? history.replace(`/cast-members/${data.data.id}/edit`)
                        : history.push(`/cast-members/${data.data.id}/edit`)
                )
                :   history.push("/cast-members");
        } catch (e) {
            enqueueSnackbar("Não foi possível salvar Membro de elenco!", {variant: "error"});
            setLoading(false);
        }
    }

    function validateSubmit(){
        triggerValidation()
            .then(isValid => {isValid && onSubmit(getValues(), null)});
    }


    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue('type', parseInt(event.target.value));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={register}
                InputLabelProps={{shrink: true}}
                error={(errors.name) !== undefined}
                helperText={errors.name && (errors as any).name.message}
            />

            <FormControl
                margin={"normal"}
                error={(errors.type) !== undefined}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup aria-label="tipo"
                            name={"type"}
                            onChange={handleRadioChange}
                            value={watch('type')+""}>
                    <FormControlLabel value="1" control={<Radio color={"primary"}/>} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio color={"primary"}/>} label="Ator" />
                </RadioGroup>
                {
                    (errors as any).type && <FormHelperText id="type-helper-text">{(errors as any).type.message}</FormHelperText>
                }
            </FormControl>
            <SubmitButtons disabledButtons={loading} handleSave={validateSubmit}/>
        </form>
    );
};