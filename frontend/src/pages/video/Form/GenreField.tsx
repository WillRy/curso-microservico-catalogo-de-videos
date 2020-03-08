import * as React from 'react';
import {AsyncAutoComplete} from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import genreHttp from "../../../util/http/genres-http";
import useHttpHandled from "../../../hooks/useHttpHandled";
import {Typography, FormControl, FormControlProps} from "@material-ui/core";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useCollectionManager from "../../../hooks/useCollectionManager";
import FormHelperText from "@material-ui/core/FormHelperText";
import {getGenresFromCategory} from "../../../util/model-filter";

interface GenreFieldProps {
    genres: any[];
    categories: any[];
    setGenres: (genres) => void;
    setCategories: (categories) => void;
    error: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

const GenreField: React.FC<GenreFieldProps> = (props) => {
    const {
        genres,
        categories,
        setGenres,
        setCategories,
        error,
        disabled
    } = props;
    const autoCompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(genres, setGenres);
    const {removeItem: removeCategory} = useCollectionManager(categories, setCategories);

    function fetchOptions(searchText) {
        return autoCompleteHttp(
            genreHttp
                .list({queryParams: {search: searchText, all: ""}})
        ).then(data => data.data).catch(error => console.log(error));
    }


    return (
        <React.Fragment>
            <AsyncAutoComplete
                fetchOptions={fetchOptions}
                TextFieldProps={{
                    label: "Gêneros",
                    error: error !== undefined
                }}
                AutocompleteProps={{
                    // autoSelect: true,
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionSelected: (option, value) => option.id === value.id,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled
                }}
            />
            <FormControl
                error={error !== undefined}
                disabled={disabled === true}
                {...props.FormControlProps}
                fullWidth
                margin={"normal"}
            >
                <GridSelected>
                    {
                        genres.map((genre, key) => (
                            <GridSelectedItem key={key} onDelete={() => {
                                const categoriesWithOneGenre = categories.filter(category => {
                                    const genresFromCategory = getGenresFromCategory(genres, category);
                                    return genresFromCategory.length === 1 && genresFromCategory.findIndex(g => g.id === genre.id) !== -1
                                });
                                categoriesWithOneGenre.forEach(cat => removeCategory(cat));
                                removeItem(genre);

                            }} xs={12}>
                                <Typography>{genre.name}</Typography>
                            </GridSelectedItem>
                        ))
                    }


                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>

        </React.Fragment>

    );
};

export default GenreField;