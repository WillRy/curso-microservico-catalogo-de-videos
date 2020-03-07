import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {TextFieldProps} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import {useState} from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import {useEffect} from "react";
import {useSnackbar} from "notistack";


interface AsyncAutoCompleteProps {
    fetchOptions: (searchText) => Promise<any>;
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<AutocompleteProps<any>, 'renderInput' | 'options'>
}

export const AsyncAutoComplete: React.FC<AsyncAutoCompleteProps> = (props) => {

    const {AutocompleteProps} = props;
    const {freeSolo, onOpen, onClose, onInputChange} = AutocompleteProps as any;
    const {enqueueSnackbar} = useSnackbar();
    const [open, setOpen] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [options, setOptions] = useState([]);

    const textFieldProps: TextFieldProps = {
        margin: "normal",
        variant: "outlined",
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    };


    const autoCompleteProps: AutocompleteProps<any> = {
        loadingText: "Carregando...",
        noOptionsText: "Nenhum item encontrado",
        ...(AutocompleteProps && {...AutocompleteProps}),
        open,
        options: options,
        loading: loading,
        onOpen() {
            setOpen(true);

            /** Chama funcao passada em props, caso exista*/
            onOpen && onOpen();
        },
        onClose() {
            setOpen(false);

            /** Chama funcao passada em props, caso exista*/
            onClose && onClose();
        },
        onInputChange(event, value) {
            setSearchText(value);

            /** Chama funcao passada em props, caso exista*/
            onInputChange && onInputChange();
        },
        renderInput: params => (
            <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {loading && <CircularProgress color={"inherit"} size={20}/>}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    )
                }}


            />
        ),
    };

    useEffect(() => {
        if(!open  && !freeSolo) {
            setOptions([])
        }
    }, [open]);

    const deps = freeSolo ? searchText: open;
    useEffect(() => {
        let isSubscribed = true;

        /**
         * Se estiver fechado ou a busca for vazia e for freeSolo
         *
         * */
        if(!open || (searchText === "" && freeSolo)) {
            return
        }

        (async () => {
            setLoading(true);
            try {
                const data = await props.fetchOptions(searchText);
                // console.log(data); return;
                if (isSubscribed) {
                    setOptions(data);
                }
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Não foi possível carregar as informações", {
                    variant: "error"
                });
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            isSubscribed = false
        }

    }, [deps]);

    return (
        <Autocomplete {...autoCompleteProps} />
    );


};