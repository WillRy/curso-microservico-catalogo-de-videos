import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from "../../util/http/category-http";
import Category from "../../util/models";
import {BadgeNo, BadgeYes} from "../../components/Badge";

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
                return value ? <BadgeYes/> : <BadgeNo/>
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

    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {

        (async () => {
            const {data} = await categoryHttp.list();
            setData(data.data);
        })();

    }, []);

    return (
        <MUIDataTable title="Categorias" columns={columnsDefinitions} data={data}/>
    );
};

export default Table;
