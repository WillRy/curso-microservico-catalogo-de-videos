import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import castMemberHttp from "../../util/http/cast-member-http";
import {CastMember, listResponse} from "../../util/models";
import {useSnackbar} from "notistack";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import useFilter from "../../hooks/useFilter";
import FilterResetButton from "../../components/Table/FilterResetButton";

const CastMemberTypeMap: { [key: string]: any } = {
    1: 'Diretor',
    2: 'Ator'
};

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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(false);
    const [data, setData] = useState<CastMember[]>([]);
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
            const {data} = await castMemberHttp.list<listResponse<CastMember>>({
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

            if (castMemberHttp.isCancelledRequest(e)) {
                return;
            }

            enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultTable
            title={"Membros de Elenco"}
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