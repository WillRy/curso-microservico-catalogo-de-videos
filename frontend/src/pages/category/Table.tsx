import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpVideo} from "../../util/http";
import {Chip} from "@material-ui/core";

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

const columnsDefinitions: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value,tableMeta, updateValue){
                return value ? <Chip label={"Sim"} color={"primary"}/> : <Chip label={"Não"} color={"secondary"}/>;
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value,tableMeta, updateValue){
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }

        }
    }
];


const Table = () => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get('/categories').then(response => {
            setData(response.data.data);
        });
    }, []);

    return (
        <MUIDataTable title="Categorias" columns={columnsDefinitions} data={data}/>
    );
};

export default Table;
