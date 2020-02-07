import * as React from 'react';
import {Button, ButtonProps, TextField, Theme} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {useForm} from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import Box from "@material-ui/core/Box";
import {useEffect} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
        className: classes.submit,
        color: "secondary",
        variant: 'contained'
    };

    const {register, handleSubmit, getValues, setValue, watch} = useForm();

    useEffect(() => {
        register( {name: "type"});
    }, [register]);

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue('type', parseInt(event.target.value));
    };

    function onSubmit(formData, event) {
        castMemberHttp.create(formData).then(response => console.log(response.data.data));
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={register}

            />

            <FormControl margin={"normal"}>
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup aria-label="tipo"
                            name={"type"}
                            onChange={handleRadioChange}
                            value={watch('type')+""}>
                    <FormControlLabel value="1" control={<Radio color={"primary"}/>} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio color={"primary"}/>} label="Ator" />
                </RadioGroup>
            </FormControl>

            <Box dir={"rtl"}>
                <Button color={"primary"} {...buttonProps} type="button" onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};