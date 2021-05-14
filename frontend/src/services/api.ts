import axios, { AxiosError } from 'axios'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { signOut } from '../hooks/useAuth'
import { AuthTokenError } from './errors/AuthTokenError'

let isRefreshing = false
let failedRequestQueue = []

export const setupAPIClient = (ctx = undefined) => {
  let cookies = parseCookies(ctx)
  
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['@auth.token']}`
    }
  })
  
  // executa diversas vezes durante a sessão do usuário
  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code == "token.expired") {
        //Token expirado
        cookies = parseCookies(ctx)
  
        const { '@auth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config
  
        if (!isRefreshing) {
          isRefreshing = true
  
          api.post('/refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data
    
            setCookie(ctx, '@auth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 1 month
              path: '/'
            })
      
            setCookie(ctx, '@auth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 1 month
              path: '/'
            })
    
            api.defaults.headers['Authorization'] = `Bearer ${token}`
  
            failedRequestQueue.forEach(request => request.onSuccess(token))
            failedRequestQueue = []

          }).catch((error) => {
            failedRequestQueue.forEach(request => request.onFailure(error))
            failedRequestQueue = []
  
            if (process.browser) {
              signOut()
            }
          }).finally(() => {
            isRefreshing = false
          })
        }
  
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              resolve(api(originalConfig))
            }, 
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
        //Token existente porém outro erro -> Deslogar o usuário
        if (process.browser) {
          //verifica que se está no lado do cliente
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }
  
    return Promise.reject(error)
  })

  return api
}