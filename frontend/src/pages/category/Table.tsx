import * as React from 'react';
import {useEffect, useRef, useState} from "react";
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from "../../util/http/category-http";
import {Category} from "../../util/models";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {listResponse} from "../../util/models";
import DefaultTable, {TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import FilterResetButton from "../../components/Table/FilterResetButton";


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

    const initialState = {
        search: '',
        pagination: {
            page: 1,
            total: 0,
            per_page: 10
        },
        order: {
            sort: null,
            dir: null
        }
    };

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); // {current: true}
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>(initialState);

    useEffect(() => {
        console.log('montou');
        return () => {console.log('desmontou')}
    }, [searchState]);


    const columns = columnsDefinitions.map(column => {
        return (column.name === searchState.order.sort)
            ?
            {
                ...column,
                options: {
                    ...column.options,
                    sortDirection: searchState.order.dir as any
                }
            }
            : column;
    });

    useEffect(() => {
        subscribed.current = true;
        getData();

        return () => {subscribed.current = false}
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order
    ]);

    async function getData(){
        setLoading(true);

        try {
            const {data} = await categoryHttp.list<listResponse<Category>>(
                {
                    queryParams: {
                        search: clearSearchText(searchState.search),
                        page: searchState.pagination.page,
                        per_page: searchState.pagination.per_page,
                        sort: searchState.order.sort,
                        dir: searchState.order.dir
                    }
                }
            );

            if(subscribed.current){
                setData(data.data);
                setSearchState(prevState => ({
                    ...prevState,
                    pagination: {
                        ...prevState.pagination,
                        total: data.meta.total
                    },

                }))
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
                searchText: searchState.search,
                page: searchState.pagination.page - 1,
                rowsPerPage: searchState.pagination.per_page,
                count: searchState.pagination.total,
                customToolbar: () => {
                    return <FilterResetButton handleClick={() => {
                        setSearchState({
                            ...initialState,
                            search: {
                                value: initialState.search
                            } as any
                        })
                    }}/>
                },
                onSearchChange: (value) => {
                    setSearchState(prevState => ({
                        ...prevState,
                        search: value,
                        pagination: {
                            ...prevState.pagination,
                            page: 1
                        }
                    }))
                },
                onChangePage: (page) => {
                    setSearchState(prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            page: page + 1
                        }
                    }))
                },
                onChangeRowsPerPage: (per_page) => {
                    setSearchState(prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            per_page: per_page
                        }
                    }))
                },
                onColumnSortChange: (changedColumn: string, direction: string) => {
                    setSearchState(prevState => ({
                        ...prevState,
                        order: {
                            sort: changedColumn,
                            dir: direction.includes('desc') ? 'desc' : 'asc'
                        }
                    }))
                }
            }}
        />
    );
};

export default Table;
