import axios from "axios";


const Default_Headers = {
        'Content-Type': 'application/json'
    };


const formatUrl = (url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
};


/***
 * baseUrl: http://xxx.com/
 * timeout: default 10000,
 * headers: default {'Content-Type': 'application/json'}
 * beforeRequest: (config) => {}, // 请求前处理
 * afterResponse: (response) => {}, // 响应后处理
 * onResponseError: (error) => {} // 响应错误处理
 */
const create = (initConf) => {
    if(!initConf?.baseURL) {
        throw new Error('missing baseURL');
    }

    let cnf = {
        baseURL: initConf.baseURL,
        timeout: initConf.timeout || 10000,
        headers: { ...Default_Headers, ...(initConf.headers || {}) }
    };

    let instance = axios.create(cnf);


    instance.interceptors.request.use(
        config => {
            config.url = formatUrl(config.url);

            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
            
            if(initConf.beforeRequest) {
                initConf.beforeRequest(config);
            }
            
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );


    instance.interceptors.response.use(
        response => {
            if(initConf.afterResponse) {
                return initConf.afterResponse(response);
            }
            return response.data;
        },
        error => {
            if(initConf.onResponseError) {
                initConf.onResponseError(error);
            }
        }
    );


    const post = async (url, params = {}, selfCnf) => {
        try {
            const response = await instance.post(url, params, selfCnf);
            return response;
        } catch (error) {
            throw error;
        }
    };


    const upload = async (url, data, selfCnf) => {
        try {
            const formData = new FormData();
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const value = data[key];
                    if (value instanceof Blob) {
                        let filename = value.name;
                        if (!filename) {
                            // 根据 Blob 类型推断文件后缀
                            const extension = value.type.split('/')[1] || 'bin';
                            filename = `${key}.${extension}`;
                        }
                        formData.append(key, value, filename);
                    } else {
                        formData.append(key, value);
                    }
                }
            }

            // The interceptor will now handle the Content-Type, so we just post.
            const response = await instance.post(url, formData, selfCnf);
            return response;
        } catch (error) {
            throw error;
        }
    };


    const get = async (url, params = {}, selfCnf) => {
        try {
            let cnf = { params };
            if(selfCnf) {
                cnf = { ...cnf, ...selfCnf };
            }
            const response = await instance.get(url, cnf);
            return response;
        } catch (error) {
            throw error;
        }
    };


    const put = async (url, params = {}, selfCnf) => {
        try {
            const response = await instance.put(url, params, selfCnf);
            return response;
        } catch (error) {
            throw error;
        }
    };


    const del = async (url, params = {}, selfCnf) => {
        try {
            const response = await instance.delete(url, { params, ...selfCnf });
            return response;
        } catch (error) {
            throw error;
        }
    };


    return {
        instance,
        post,
        upload,
        get,
        put,
        del
    };
};


export default {
    create
};