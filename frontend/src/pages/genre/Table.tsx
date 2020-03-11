import * as React from 'react';
import {useContext, useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../util/http/genres-http";
import {Category, Genre, listResponse} from "../../util/models";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import FilterResetButton from "../../components/Table/FilterResetButton";
import * as yup from "../../util/vendor/yup";
import categoryHttp from "../../util/http/category-http";
import IconButton from "@material-ui/core/IconButton/IconButton";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import LoadingContext from "../../components/Loading/LoadingContext";

const columnsDefinitions: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        options: {
            filter: false
        }
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            filterType: "multiselect",
            filterOptions: {
                names: []
            },
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
            filterOptions: {
                names: ['Sim', 'Nāo']
            },
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {

                return <span> {
                    format(parseISO(value), 'dd/MM/yyyy')
                } </span>
            }
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender:(value, tableMeta, updateValue) => {
                return (
                    <IconButton
                        color={"secondary"}
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}>
                        <EditIcon/>
                    </IconButton>
                )
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
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const [categories, setCategories] = useState<Category[]>([]);

    const loading = useContext(LoadingContext);

    const {
        columns,
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
        tableRef: tableRef,
        extraFilter: {
            createValidationSchema: () => {

                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(",");
                        })
                        .default(null)

                });

            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        {categories: debouncedState.extraFilter.categories.join(',')}
                    )
                } : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    categories: queryParams.get('categories')
                }
            }
        }
    });

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = debouncedFilterState.extraFilter && debouncedFilterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];

    const serverSideFilterList = columns.map(column => []);
    if (categoriesFilterValue) {
        serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
    }


    useEffect(() => {
        subscribed.current = true;

        (async () => {

            try {
                const {data} = await categoryHttp.list({queryParams: {all: ''}});

                if (subscribed.current) {
                    setCategories(data.data);
                    (columnCategories.options as any).filterOptions.names = data.data.map(category => category.name);
                }
            } catch (e) {
                console.log(e);
                if (categoryHttp.isCancelledRequest(e)) {
                    return;
                }
                enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
            }


        })();

        return () => {
            subscribed.current = false
        }
    }, [enqueueSnackbar]);

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
        debouncedFilterState.order,
        JSON.stringify(debouncedFilterState.extraFilter)
    ]);

    async function getData() {

        try {

            const {data} = await genreHttp.list<listResponse<Genre>>({
                queryParams: {
                    search: filterManager.clearSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.categories &&
                        {categories: debouncedFilterState.extraFilter.categories.join(',')}
                    )
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
                onFilterChange: (column, filterList, type) => {

                    const columnIndex = columns.findIndex(c => c.name === column);

                    if(columnIndex && filterList[columnIndex]){
                        filterManager.changeExtraFilter({
                            [column]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    } else {
                        filterManager.clearExtraFilter();
                    }

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