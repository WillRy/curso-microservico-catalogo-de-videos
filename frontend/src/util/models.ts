export default interface Category {
    id: string
    name: string;
    description?: string
    is_active: boolean
}

export default interface Genre {
    id: string;
    name: string;
    is_active: boolean;
    categories_id: [];
}

export default interface CastMember {
    id: string;
    name: string;
    type: number
}
