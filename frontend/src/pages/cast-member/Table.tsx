import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import castMemberHttp from "../../util/http/cast-member-http";

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
        (async () => {
            const {data} = await castMemberHttp.list();
            setData(data.data);
        })();
    }, []);

    return (
        <MUIDataTable title={"Elenco"} columns={columnsDefinitions} data={data}/>
    );
};


export default Table;