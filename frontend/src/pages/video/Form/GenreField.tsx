import * as React from 'react';
import {AsyncAutoComplete, AsyncAutoCompleteComponent} from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import genreHttp from "../../../util/http/genres-http";
import useHttpHandled from "../../../hooks/useHttpHandled";
import {Typography, FormControl, FormControlProps, useTheme} from "@material-ui/core";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useCollectionManager from "../../../hooks/useCollectionManager";
import FormHelperText from "@material-ui/core/FormHelperText";
import {getGenresFromCategory} from "../../../util/model-filter";
import {RefAttributes, useCallback} from "react";
import {useImperativeHandle} from "react";
import {useRef} from "react";
import {MutableRefObject} from "react";

interface GenreFieldProps extends RefAttributes<GenreFieldComponent>{
    genres: any[];
    categories: any[];
    setGenres: (genres) => void;
    setCategories: (categories) => void;
    error: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

export interface GenreFieldComponent {
    clear: () => void;
}

const GenreField = React.forwardRef<GenreFieldComponent, GenreFieldProps>((props, ref) => {
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

    const autoCompleteRef = useRef() as MutableRefObject<AsyncAutoCompleteComponent>;
    const theme = useTheme();

    const fetchOptions = useCallback((searchText) => {
        return autoCompleteHttp(
            genreHttp.list({queryParams: {search: searchText, all: ""}})
        ).then(data => data.data).catch(error => console.log(error));
    }, [autoCompleteHttp])


    useImperativeHandle(ref, () => ({
        clear: () => autoCompleteRef.current.clear()
    }));

    return (
        <React.Fragment>
            <AsyncAutoComplete
                ref={autoCompleteRef}
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
            <FormHelperText style={{height: theme.spacing(3)}}>
                Escolha os gêneros do vídeo
            </FormHelperText>
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
});

export default GenreField;
