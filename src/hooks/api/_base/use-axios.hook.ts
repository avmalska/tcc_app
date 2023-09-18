import axios from "axios";

export function useAxios(baseUrl: string) {
  return axios.create({
    baseURL: baseUrl
  })
}