import Router from 'next/router'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '../services/apiClient'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, '@auth.token')
  destroyCookie(undefined, '@auth.refreshToken')

  authChannel.postMessage('signOut')

  Router.push('/')
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>({} as User)
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { '@auth.token': token } = parseCookies()

    if (token) {
      api.get('me')
      .then(response => {
        const { email, permissions, roles } = response.data

        setUser({
          email, 
          permissions, 
          roles
        })
      }).catch(() => {
        signOut()
      })
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const { token, refreshToken, roles, permissions } = response.data
      
      setCookie(undefined, '@auth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 1 month
        path: '/'
      })

      setCookie(undefined, '@auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 1 month
        path: '/'
      })
  
      setUser({
        email,
        roles,
        permissions
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (error) {
      console.log(error.message)
    }    
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated, 
      signIn,
      signOut,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  return context
}