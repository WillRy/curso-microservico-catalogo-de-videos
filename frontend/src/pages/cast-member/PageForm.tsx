import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";
import { useParams } from 'react-router-dom';

const PageForm = () => {
    const {id} = useParams();
    return (
        <Page title={!id ? "Criar membro de elenco" : "Editar membro de elenco"}>
            <Form/>
        </Page>
    );
};


export default PageForm;