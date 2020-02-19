import * as React from 'react';
import {useEffect, useReducer, useRef, useState} from "react";
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from "../../util/http/category-http";
import {Category} from "../../util/models";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {listResponse} from "../../util/models";
import DefaultTable, {TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import FilterResetButton from "../../components/Table/FilterResetButton";
import reducer,{INITIAL_STATE, Creators} from '../../store/filter/index';

const columnsDefinitions: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '30%',
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '43%'
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value,tableMeta, updateValue){
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        },
        width: '4%'
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value,tableMeta, updateValue){
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }

        },
        width: '10%'
    },
    {
        name: 'actions',
        label: "Ações",
        width: '13%'
    }
];

interface Pagination{
    page: number;
    total: number;
    per_page: number;
}

interface Order{
    sort: string | null;
    dir: string | null;
}

interface SearchState {
    search: string;
    pagination: Pagination;
    order: Order;
}

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); // {current: true}
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [filterState, dispatch] = useReducer(reducer, INITIAL_STATE);

    useEffect(() => {
        console.log('montou');
        return () => {console.log('desmontou')}
    }, [filterState]);


    const columns = columnsDefinitions.map(column => {
        return (column.name === filterState.order.sort)
            ?
            {
                ...column,
                options: {
                    ...column.options,
                    sortDirection: filterState.order.dir as any
                }
            }
            : column;
    });

    useEffect(() => {
        subscribed.current = true;
        getData();

        return () => {subscribed.current = false}
    }, [
        filterState.search,
        filterState.pagination.page,
        filterState.pagination.per_page,
        filterState.order
    ]);

    async function getData(){
        setLoading(true);

        try {
            const {data} = await categoryHttp.list<listResponse<Category>>(
                {
                    queryParams: {
                        search: clearSearchText(filterState.search),
                        page: filterState.pagination.page,
                        per_page: filterState.pagination.per_page,
                        sort: filterState.order.sort,
                        dir: filterState.order.dir
                    }
                }
            );

            if(subscribed.current){
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        }catch (e) {
            console.log(e);
            if(categoryHttp.isCancelledRequest(e)){
                return;
            }
            enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
        } finally {
            setLoading(false);
        }
    }

    function clearSearchText(text){
        let newText = text;
        if(text && text.value !== undefined){
            newText = text.value;
        }
        return newText;
    }

    return (
        <DefaultTable
            title="Categorias"
            columns={columns}
            data={data}
            loading={loading}
            debouncedSearchTime={300}
            options={{
                serverSide: true,
                searchText: filterState.search as any,
                page: filterState.pagination.page - 1,
                rowsPerPage: filterState.pagination.per_page,
                count: totalRecords,
                customToolbar: () => {
                    return <FilterResetButton handleClick={() => dispatch(Creators.setReset())}/>
                },
                onSearchChange: (value) => dispatch(Creators.setSearch({search: value})),
                onChangePage: (page) => dispatch(Creators.setPage({page: page + 1})),
                onChangeRowsPerPage: (per_page) => dispatch(Creators.setPerPage({per_page: per_page})),
                onColumnSortChange: (changedColumn: string, direction: string) => dispatch(Creators.setOrder({
                    sort: changedColumn,
                    dir:direction.includes('desc') ? 'desc' : 'asc'
                }))
            }}
        />
    );
};

export default Table;
