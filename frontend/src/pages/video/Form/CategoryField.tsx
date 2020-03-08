import * as React from 'react';
import {AsyncAutoComplete} from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useHttpHandled from "../../../hooks/useHttpHandled";
import categoryHttp from "../../../util/http/category-http";
import {FormControl, FormControlProps, Typography} from '@material-ui/core';
import useCollectionManager from "../../../hooks/useCollectionManager";
import {Genre} from "../../../util/models";
import FormHelperText from "@material-ui/core/FormHelperText";
import {getGenresFromCategory} from "../../../util/model-filter";
import {makeStyles} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";

const useStyles = makeStyles(({
    genreSubtitle: {
        fontSize: '0.8rem',
        color: grey["800"]
    }
}));

interface CategoryFieldProps {
    categories: any[];
    setCategories: (categories) => void;
    genres: Genre[],
    error: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps;
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const {categories, setCategories, genres, disabled, error} = props;
    const autoCompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);

    const classes = useStyles();

    function fetchOptions() {
        return autoCompleteHttp(
            categoryHttp
                .list({
                    queryParams: {
                        genres: genres.map(genre => genre.id).join(','),
                        all: ""
                    }
                })
        ).then(data => data.data).catch(error => console.log(error));
    }

    return (
        <React.Fragment>
            <AsyncAutoComplete
                fetchOptions={fetchOptions}
                TextFieldProps={{
                    label: "Categorias",
                    error: error !== undefined
                }}
                AutocompleteProps={{
                    clearOnEscape: true,
                    freeSolo: false,
                    getOptionSelected: (option, value) => option.id === value.id,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genres.length
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
                        categories.map((category, key) => {
                            const genresFromCategory = getGenresFromCategory(genres, category).map(genre => genre.name).join(',');

                            return (
                                <GridSelectedItem key={key} onDelete={() => removeItem(category)} xs={12}>
                                    <Typography noWrap={true}>{category.name}</Typography>
                                    <Typography noWrap={true} className={classes.genreSubtitle}>Gêneros: {genresFromCategory}</Typography>
                                </GridSelectedItem>
                            )
                        })
                    }


                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </React.Fragment>

    );
};

export default CategoryField;