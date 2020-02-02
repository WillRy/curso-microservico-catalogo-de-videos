import { RouteProps } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from '../pages/category/List';

export interface MyRouteProps extends RouteProps{
    label: string,
    name: string
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: "Listar categorias",
        path: "/categories",
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: "Criar categorias",
        path: "/categories/create",
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.edit',
        label: "Editar categorias",
        path: "/categories/:id/edit",
        component: CategoryList,
        exact: true
    }
];

export default routes;