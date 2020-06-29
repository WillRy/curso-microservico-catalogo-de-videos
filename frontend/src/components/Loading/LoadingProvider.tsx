import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import LoadingContext from "./LoadingContext";
import {
    addGlobalRequestInterceptor,
    addGlobalResponseInterceptor,
    removeGlobalRequestInterceptor,
    removeGlobalResponseInterceptor
} from "../../util/http";
import {omit} from 'lodash';

export const LoadingProvider = (props) => {
    const [loading, setLoading] = useState(false);
    const [countRequest, setCountRequest] = useState(0);


    /** Evitar registro duplicado de interceptors */
    /**
     * IMPORTANTE
     * Deve-se usar o useMemo, pois o mesmo não tem relação com ciclo de vida, sendo executado primeiro
     * já o useEffect pode ser executado muito depois, ou seja, algumas requests iniciais não teriam ainda
     * os interceptors
     *
     * */
    useMemo(() => {
        let isSubscribed = true;

        const requestsIds = addGlobalRequestInterceptor(
            config => {
                if (isSubscribed && !config.headers.hasOwnProperty('x-ignore-loading')) {
                    setLoading(true);
                    setCountRequest((prevState => prevState + 1))
                }

                return config
            });

        const responseIds = addGlobalResponseInterceptor(
            response => {
                if (isSubscribed && !response.config.headers.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest();
                }
                return response;
            }, error => {
                if (isSubscribed && !error.config.headers.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest();
                }
                return Promise.reject(error);
            });


        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestsIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, []);

    /**
     * Existe para garantir que requisições subsequentes não anulem o loading uma das outras
     * */
    useEffect(() => {
        if (!countRequest) {
            setLoading(false);
        }
    }, [countRequest]);

    function decrementCountRequest() {
        setCountRequest((prevState => prevState - 1))
    }


    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};
