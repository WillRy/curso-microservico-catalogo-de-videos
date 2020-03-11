import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';



export const httpVideo = axios.create({
    baseURL: process.env.REACT_APP_MICRO_VIDEO_API_URL
});

const instances = [httpVideo];

export function addGlobalRequestInterceptor(
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: any) => any
) {
    let ids: number[] = [];
    for(let i of instances){
        const id = i.interceptors.request.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalRequestInterceptor(ids) {
    ids.forEach((id, index) => instances[index].interceptors.request.eject(id));
}

export function addGlobalResponseInterceptor(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
) {
    let ids: number[] = [];
    for(let i of instances){
        const id = i.interceptors.response.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalResponseInterceptor(ids) {
    ids.forEach((id, index) => instances[index].interceptors.response.eject(id));
}
