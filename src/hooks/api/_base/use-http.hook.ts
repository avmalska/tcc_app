import {useAxios} from "./use-axios.hook";

export function useHttp(baseUrl: string) {
  const instance = useAxios(baseUrl);

  const get = async (url: string = "") => {
    const response =  await instance.get(url);
    return response.data
};

  const post = async (url: string, data: any) => {
    const response = await instance.post(url, data);
    return response.data
  };

  return {
    get,
    post,
  }
}