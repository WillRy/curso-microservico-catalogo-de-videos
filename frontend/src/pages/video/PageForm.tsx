import * as React from 'react';
import Form from "./Form";
import { useParams } from 'react-router-dom';
import {Page} from "../../components/Page";


const PageForm = () => {
    const {id} = useParams();
    return (
        <Page title={!id ? "Cadastro de vídeos" : "Edição de vídeo"}>
            <Form/>
        </Page>
    );
};

export default PageForm;