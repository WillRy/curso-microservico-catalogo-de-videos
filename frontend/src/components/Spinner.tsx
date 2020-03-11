import * as React from 'react';
import {LinearProgress, MuiThemeProvider, Theme} from "@material-ui/core";
import {useContext} from "react";
import LoadingContext from "./Loading/LoadingContext";
import Fade from "@material-ui/core/Fade";

function makeLocalTheme(theme: Theme): Theme {
    return {
        ...theme,
        palette: {
            ...theme.palette,
            primary: theme.palette.error,
            type: "dark"
        }
    }
}

interface SpinnerProps {

}

const Spinner: React.FC<SpinnerProps> = (props) => {

    const loading = useContext(LoadingContext);

    return (
        <MuiThemeProvider theme={makeLocalTheme}>
            <Fade in={loading} timeout={{exit: 300}}>
                <LinearProgress
                    style={{
                        position: "fixed",
                        width: "100%",
                        zIndex: 9999
                    }}
                />
            </Fade>
        </MuiThemeProvider>
    );
};


export default Spinner;