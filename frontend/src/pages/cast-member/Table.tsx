import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpVideo} from "../../util/http";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

const CastMemberTypeMap:  { [key: string]: any } = {
    1: 'Diretor',
    2: 'Ator'
};

const columnsDefinitions:MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value: number, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {

                return <span> {
                    format(parseISO(value), 'dd/MM/yyyy')
                } </span>

            }
        }

    }


];
const Table = () => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get('/cast_members').then(response => {
            setData(response.data.data);
        })
    }, []);

    return (
        <MUIDataTable title={"Elenco"} columns={columnsDefinitions} data={data}/>
    );
};


export default Table;