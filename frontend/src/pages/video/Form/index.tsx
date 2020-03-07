import * as React from 'react';
import {useEffect, useState} from 'react';
import * as yup from '../../../util/vendor/yup';
import {useForm} from "react-hook-form";
import {DefaultForm} from "../../../components/DefaultForm";
import {
    Checkbox,
    FormControlLabel,
    Grid,
    TextField, Theme,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {useHistory, useParams} from 'react-router-dom';
import {Video, VideoFileFieldsMap} from "../../../util/models";
import {useSnackbar} from "notistack";
import videoHttp from "../../../util/http/video-http";
import SubmitActions from "../../../components/SubmitActions";
import {RatingField} from "./RatingField";
import {UploadField} from "./UploadField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {AsyncAutoComplete} from "../../../components/AsyncAutoComplete";
import genreHttp from "../../../util/http/genres-http";


const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    }

}));

const validationSchema = yup.object().shape({
    title: yup.string()
        .label("Título")
        .required()
        .max(255),
    description: yup.string()
        .label("Sinopse")
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup.number()
        .label("Duração")
        .required()
        .min(1),
    rating: yup.string()
        .label("Classificação")
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);
const Index = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation
    } = useForm({
        validationSchema,
        defaultValues: {
            rating: '',
            opened: false
        }
    });

    const {id} = useParams();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        ['rating', 'opened', ...fileFields].forEach(name => register({name: name}))
    }, [register]);

    useEffect(() => {

        if (!id) {
            return;
        }

        (async function getVideo() {
            setLoading(true);

            try {
                const {data} = await videoHttp.get(id);
                setVideo(data.data);
                reset(data.data);

            } catch (e) {
                console.log(e);
                enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
            } finally {
                setLoading(false);
            }
        })();
    }, [enqueueSnackbar, id, reset]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video ? videoHttp.create(formData) : videoHttp.update(video.id, formData);
            const {data} = await http;
            enqueueSnackbar('Vídeo salvo com sucesso!', {variant: "success"});
            setLoading(false);

            event
                ? (
                    id
                        ? history.replace(`/videos/${data.data.id}/edit`)
                        : history.push(`/videos/${data.data.id}/edit`)
                )
                : history.push('/videos');

        } catch (e) {
            console.log(e);
            enqueueSnackbar("Não foi possível salvar as informações", {variant: "error"});
            setLoading(false);
        }

    }

    const validateSubmit = () => {
        triggerValidation().then(isValid => {
            isValid && onSubmit(getValues(), null)
        });
    };

    const fetchOptions = (searchText) => genreHttp
        .list({queryParams: {search: searchText, all: ""}})
        .then(({data}) => data.data);


    const classes = useStyles();
    return (

        <DefaultForm GridItemProps={{xs: 12}} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name={"title"}
                        label={"Título"}
                        variant={"outlined"}
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={(errors as any).title !== undefined}
                        helperText={(errors as any).title && (errors as any).title.message}

                    />

                    <TextField
                        name={"description"}
                        label={"Sinopse"}
                        multiline
                        rows="4"
                        margin="normal"
                        variant={"outlined"}
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={(errors as any).description !== undefined}
                        helperText={(errors as any).description && (errors as any).description.message}

                    />

                    <Grid container spacing={1}>
                        <Grid item xs={6}>

                            <TextField
                                name={"year_launched"}
                                label={"Ano de lançamento"}
                                type={"number"}
                                margin="normal"
                                variant={"outlined"}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={(errors as any).year_launched !== undefined}
                                helperText={(errors as any).year_launched && (errors as any).year_launched.message}

                            />

                        </Grid>

                        <Grid item xs={6}>

                            <TextField
                                name={"duration"}
                                label={"Duraçāo"}
                                type={"number"}
                                margin="normal"
                                variant={"outlined"}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={(errors as any).duration !== undefined}
                                helperText={(errors as any).duration && (errors as any).duration.message}

                            />

                        </Grid>
                    </Grid>

                    Elenco
                    <br/>

                    <AsyncAutoComplete
                        fetchOptions={fetchOptions}
                        TextFieldProps={{
                            label: "Gêneros"
                        }}
                        AutocompleteProps={{
                            freeSolo: false,
                            getOptionLabel: option => option.name,
                            getOptionSelected: option => option.id
                        }}
                    />
                    <br/>

                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating') + ""}
                        setValue={(value => setValue('rating', value, true))}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{margin: isGreaterMd ? 'none' : 'normal'}}
                    />
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={"primary"} variant={"h6"}>Imagens</Typography>

                            <UploadField
                                label={"Thumb"}
                                accept={"image/*"}
                                setValue={(value => setValue('thumb_file', value))}
                                error={null}/>

                            <UploadField
                                label={"Banner"}
                                accept={"image/*"}
                                setValue={(value => setValue('banner_file', value))}
                                error={null}/>
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={"primary"} variant={"h6"}>Vídeos</Typography>
                            <UploadField
                                label={"Trailer"}
                                accept={"video/mp4"}
                                setValue={(value => setValue('trailer_file', value))}
                                error={null}/>

                            <UploadField
                                label={"Vídeo"}
                                accept={"video/mp4"}
                                setValue={(value => setValue('video_file', value))}
                                error={null}/>
                        </CardContent>
                    </Card>

                    <br/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name={"opened"}
                                color={"primary"}
                                onChange={() => {
                                    setValue('opened', !getValues()['opened']);
                                    console.log(getValues())
                                }}
                                checked={watch('opened') as boolean}
                                disabled={loading}
                            />
                        }
                        label={
                            <Typography color="primary" variant="subtitle2">
                                Quero que este conteúdo apareça na seçāo de lançamentos
                            </Typography>
                        }
                        labelPlacement={"end"}
                    />
                </Grid>

            </Grid>

            <SubmitActions handleSave={validateSubmit} disabledButtons={loading}/>
        </DefaultForm>
    );
};

export default Index;