import * as React from 'react';
import {Chip, MuiThemeProvider} from "@material-ui/core";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import theme from "../theme";

const localTheme = createMuiTheme({
    palette: {
        primary: theme.palette.success,
        secondary: theme.palette.error
    }
});

export const BadgeYes = () => {
    return (
        <MuiThemeProvider theme={localTheme}>
            <Chip label={"Sim"} color={"primary"}/>
        </MuiThemeProvider>
    );
};

export const BadgeNo = () => {
    return (
        <MuiThemeProvider theme={localTheme}>
            <Chip label={"Não"} color={"secondary"}/>
        </MuiThemeProvider>
    )
};
