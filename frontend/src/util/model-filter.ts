import {Genre} from "./models";

export function getGenresFromCategory(genres: Genre[], category) {
    return genres.filter(
        genre => genre.categories.filter(cat => cat.id === category.id).length !== 0
    );
}