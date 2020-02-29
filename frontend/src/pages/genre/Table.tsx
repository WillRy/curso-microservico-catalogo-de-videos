import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../util/http/genres-http";
import {Genre, listResponse} from "../../util/models";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from "../../components/Table";
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

export const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState<Genre[]>([]);
    const subscribed = useRef(true);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinitions,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions,
        debounceTime: debounceTime,
        tableRef: tableRef
    });

    const filteredSearch = filterManager.clearSearchText(debouncedFilterState.search);

    useEffect(() => {
        subscribed.current = true;
        getData();
        filterManager.pushHistory();
        return () => {
            subscribed.current = false;
        }
    }, [
        filteredSearch,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order
    ]);

    async function getData() {
        setLoading(true);

        try {

            const {data} = await genreHttp.list<listResponse<Genre>>({
                queryParams: {
                    search: filterManager.clearSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir
                }
            });

            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }

        } catch (e) {
            console.log(e);
            if (genreHttp.isCancelledRequest(e)) {
                return;
            }
            enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultTable
            title={"Gêneros"}
            columns={filterManager.columns}
            data={data}
            loading={loading}
            debouncedSearchTime={debouncedSearchTime}
            ref={tableRef}
            options={{
                serverSide: true,
                searchText: filterState.search as any,
                page: filterState.pagination.page - 1,
                rowsPerPage: rowsPerPage,
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