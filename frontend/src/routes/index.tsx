import { RouteProps } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from '../pages/category/PageList';
import CastMemberList from '../pages/cast-member/PageList';
import GenreList from '../pages/genre/PageList';
import CategoryCreate from '../pages/category/PageForm';
import CastMemberCreate from '../pages/cast-member/PageForm';
import GenreCreate from '../pages/genre/PageForm';

export interface MyRouteProps extends RouteProps{
    label: string,
    name: string
}

const routes:MyRouteProps[] = [
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
        label: 'Criar categorias',
        path: '/categories/create',
        component: CategoryCreate,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryList,
        exact: true
    },
    {
        name: 'cast_members.list',
        label: 'Listar membros de elencos',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: 'Criar membros de elencos',
        path: '/cast-members/create',
        component: CastMemberCreate,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar membros de elencos',
        path: '/cast-members/:id/edit',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'Listar gêneros',
        path: '/genres',
        component: GenreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar gêneros',
        path: '/genres/create',
        component: GenreCreate,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gêneros',
        path: '/genres/:id/edit',
        component: GenreList,
        exact: true
    }

];

export default routes;