import * as React from 'react';
import {Page} from "../../components/Page";
import {Box} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import {Link} from "react-router-dom";
import {Add} from "@material-ui/icons";
import Table from "./Table";

const PageList = () => {
    return (
        <Page title={"Listagem de gêneros"}>
            <Box dir={"rtl"} paddingBottom={2}>
                <Fab
                    title="Adicionar gênero"
                    size="small"
                    component={Link} to={"/genres/create"}
                    color={"secondary"}
                >
                    <Add/>
                </Fab>
            </Box>
            <Box>
                <Table/>
            </Box>
        </Page>
    );
};

export default PageList;