import * as React from 'react';
import {Button, ButtonProps, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

interface SubmitActionsProps {
    disabledButtons: boolean;
    handleSave: () => void;
}

const SubmitButtons: React.FC<SubmitActionsProps> = (props) => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: 'contained',
        disabled: props.disabledButtons === undefined ? false : props.disabledButtons
    };

    return (
        <Box dir="rtl">
            <Button color={"primary"} {...buttonProps} type="button" onClick={props.handleSave}>Salvar</Button>
            <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
        </Box>
    );
};

export default SubmitButtons;