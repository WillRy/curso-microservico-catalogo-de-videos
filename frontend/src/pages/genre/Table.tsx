import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {useEffect, useState} from "react";
import {httpVideo} from "../../util/http";
import {BadgeNo, BadgeYes} from "../../components/Badge";


const columnsDefinitions: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender(value, tableMeta, updateValue) {

                return <span> {
                    value.map((value: { name: any; }) => value.name).join(', ')
                } </span>

            },
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
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

export const Table = () => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get('/genres').then(response => {
            console.log(response.data.data);
            setData(response.data.data);
        })
    }, []);


    return (
        <MUIDataTable title={"Gêneros"} columns={columnsDefinitions} data={data}/>
    );
};

export default Table;