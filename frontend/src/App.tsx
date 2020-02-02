import React from 'react';
import {Navbar} from "./components/Navbar";
import {Page} from "./components/Page";
import {Box} from "@material-ui/core";

const App = () => {
    return (
        <React.Fragment>
            <Navbar/>
            <Box paddingTop="70px">
                <Page title={"Titulo"}/>
            </Box>
        </React.Fragment>
    );
};

export default App;
