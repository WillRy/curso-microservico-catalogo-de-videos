import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {useEffect, useState} from "react";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../util/http/genres-http";


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
        let isSubscribed = true;

        (async () => {
            const {data} = await genreHttp.list();
            if(isSubscribed){
                setData(data.data);
            }

        })();

        return () => { isSubscribed = false }
    }, []);


    return (
        <MUIDataTable title={"Gêneros"} columns={columnsDefinitions} data={data}/>
    );
};

export default Table;