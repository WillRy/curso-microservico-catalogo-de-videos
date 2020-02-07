import React from 'react';
import {Navbar} from "./components/Navbar";
import {Box, MuiThemeProvider} from "@material-ui/core";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumbs from "./components/Breadcrumbs";
import theme from "./theme";
import CssBaseline from "@material-ui/core/CssBaseline";

const App = () => {
    return (
        <React.Fragment>
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <BrowserRouter>
                    <Navbar/>
                    <Box paddingTop="70px">
                        <Breadcrumbs/>
                        <AppRouter/>
                    </Box>
                </BrowserRouter>
            </MuiThemeProvider>
        </React.Fragment>
    );
};

export default App;
