import {useSnackbar} from "notistack";
import Axios from "axios";

const useHttpHandled = () => {
    const {enqueueSnackbar} = useSnackbar();

    return async (request: Promise<any>) => {
        try {
            const {data} = await request;

            return data;
        } catch (e) {
            console.log(e);
            if (!Axios.isCancel(e)) {
                enqueueSnackbar("Não foi possível carregar as informações", {variant: "error"});
            }
            throw e;
        }
    }
};

export default useHttpHandled;