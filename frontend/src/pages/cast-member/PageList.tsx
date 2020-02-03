import * as React from 'react';
import {Page} from "../../components/Page";
import {Box} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import {Link} from "react-router-dom";
import {Add} from "@material-ui/icons";
import Table from "./Table";


const PageList = () => {
    return (
        <Page title={"Listagem de elenco"}>
            <Box dir={"rtl"}>
                <Fab
                    title="Adicionar membro"
                    size="small"
                    component={Link} to={"/castmember/create"}
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