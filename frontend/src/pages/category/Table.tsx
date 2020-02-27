import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from "../../util/http/category-http";
import {Category, listResponse} from "../../util/models";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import DefaultTable, {TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import FilterResetButton from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import {MuiDataTableRefComponent} from '../../components/Table';

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


const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); // {current: true}
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        filterManager,
        filterState,
        totalRecords,
        setTotalRecords,
        debouncedFilterState
    } = useFilter({
        columns: columnsDefinitions,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions,
        debounceTime: debounceTime,
        tableRef
    });


    const filteredSearch = filterManager.clearSearchText(debouncedFilterState.search);


    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();

        return () => {subscribed.current = false}
    }, [
        filteredSearch,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order
    ]);

    async function getData(){
        setLoading(true);

        try {
            const {data} = await categoryHttp.list<listResponse<Category>>(
                {
                    queryParams: {
                        search: filterManager.clearSearchText(filterState.search),
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


    return (
        <DefaultTable
            title="Categorias"
            columns={filterManager.columns}
            data={data}
            loading={loading}
            debouncedSearchTime={debouncedSearchTime}
            ref={tableRef}
            options={{
                serverSide: true,
                searchText: filterState.search as any,
                page: filterState.pagination.page - 1,
                rowsPerPage: filterState.pagination.per_page,
                rowsPerPageOptions: rowsPerPageOptions,
                count: totalRecords,
                customToolbar: () => {
                    return <FilterResetButton handleClick={() => filterManager.resetFilter()}/>
                },
                onSearchChange: (value) => filterManager.changeSearch(value),
                onChangePage: (page) => filterManager.changePage(page),
                onChangeRowsPerPage: (per_page) => filterManager.changeRowsPerPage(per_page),
                onColumnSortChange: (changedColumn: string, direction: string) => filterManager.changeSort(changedColumn, direction)
            }}
        />
    );
};

export default Table;
