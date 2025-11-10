import axios, { AxiosRequestConfig } from 'axios'
import Cookie from 'js-cookie'

type ApiOptions = Omit<AxiosRequestConfig, 'baseURL'>

const BASE_URL =
  process.env.NODE_ENV == 'development'
    ? process.env.NEXT_PUBLIC_DEVELOPMENT_BASE_URL
    : process.env.NEXT_PUBLIC_BASE_URL

const CACHE_CONTROL =
  process.env.NODE_ENV == 'development'
    ? {}
    : {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      }

function api<T = unknown>({ headers, timeout, ...options }: ApiOptions) {
  const token = Cookie.get('affiliates-token')

  return axios<T>({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...CACHE_CONTROL,
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...headers,
    },
    ...options,
  })
}

export { api }
