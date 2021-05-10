import { createContext, ReactNode, useContext } from 'react'

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const isAuthenticated = false

  async function signIn({ email, password }: SignInCredentials) {
    console.log({email, password})
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated, 
      signIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  return context
}