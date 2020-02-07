import * as React from 'react';
import {Page} from "../../components/Page";
import {Box} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import {Link} from "react-router-dom";
import {Add} from "@material-ui/icons";
import Table from "./Table";


const PageList = () => {
    return (
        <Page title={"Listagem de membro de elenco"}>
            <Box dir={"rtl"} paddingBottom={2}>
                <Fab
                    title="Adicionar membro de elenco"
                    size="small"
                    component={Link} to={"/cast-members/create"}
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