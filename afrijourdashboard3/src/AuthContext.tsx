
import { createContext, useState, useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { BASE_URL } from './config'

interface AuthContextType {
  user: any
  loginUser: (email: string, password: string) => Promise<void>
  logoutUser: () => void
  registerUser: (
    email: string,
    user_name: string,
    password: string
  ) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | null>(null)
export default AuthContext

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authTokens, setAuthTokens] = useState<any>(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens')!)
      : null
  )
  const [user, setUser] = useState<any>(() =>
    localStorage.getItem('authTokens')
      ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')!).access)
      : null
  )
  const [loading, setLoading] = useState(true)

  // ✅ Token expiry check function
  const isTokenExpired = (token: string) => {
    try {
      const decoded: any = jwtDecode(token)
      const now = Date.now() / 1000
      return decoded.exp < now
    } catch (error) {
      console.error('Error decoding token:', error)
      return true
    }
  }

  // ✅ Refresh token function
  const refreshToken = async () => {
    console.log('🔄 Running refreshToken function...')
    if (!authTokens?.refresh) {
      console.log('⛔ No refresh token found')
      logoutUser()
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/api/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: authTokens.refresh }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Tokens refreshed:', data)
        setAuthTokens(data)
        setUser(jwtDecode(data.access))
        localStorage.setItem('authTokens', JSON.stringify(data))
      } else {
        console.error('❌ Failed to refresh token. Logging out.')
        logoutUser()
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error)
      logoutUser()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authTokens) {
      console.log('⛔ No tokens found.')

      setLoading(false) // ✅ ensure loading ends

      // ✅ Avoid infinite redirect loop
      if (window.location.pathname !== '/sign-in') {
        console.log('Redirecting to login...')
        logoutUser()
      }

      return
    }

    const expired = isTokenExpired(authTokens.access)
    if (expired) {
      console.log('🔔 Access token expired. Refreshing...')
      refreshToken()
    } else {
      console.log('✅ Access token valid.')
      setUser(jwtDecode(authTokens.access))
      setLoading(false)
    }
  }, [authTokens])

  // ✅ NEW useEffect for periodic refresh
  useEffect(() => {
    if (!authTokens) return

    const interval = setInterval(
      () => {
        console.log('🔄 Refreshing token periodically...')
        refreshToken()
      },
      1000 * 60 * 4
    ) // every 4 minutes (adjust based on token expiry time)

    return () => clearInterval(interval) // cleanup on unmount
  }, [authTokens])

  const loginUser = async (email: string, password: string) => {
    let response: Response
    try {
      response = await fetch(`${BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch (error: any) {
      // Network/DNS/CORS failure — fetch never got a response.
      console.error('Login network error:', error)
      throw new Error(
        `Could not reach the server (${error?.message ?? 'network error'}). ` +
          `Check your connection and try again.`
      )
    }

    let data: any = null
    try {
      data = await response.json()
    } catch {
      // ignore body-parse error; we'll still branch on response.ok below
    }

    if (response.ok) {
      setAuthTokens(data)
      setUser(jwtDecode(data.access))
      localStorage.setItem('authTokens', JSON.stringify(data))
      window.location.href = '/'
      return
    }

    // Response arrived but the server rejected the credentials/request.
    const serverDetail =
      (data && (data.detail || data.error || data.message)) ||
      `HTTP ${response.status} ${response.statusText}`
    throw new Error(serverDetail)
  }

  const registerUser = async (
    email: string,
    user_name: string,
    password: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_name, password }),
      })

      if (response.ok) {
        window.location.href = '/sign-in'
      } else {
        alert('Registration failed.')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/reset_password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        alert('Check your email for the password reset link.')
      } else {
        alert('Password reset failed.')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const logoutUser = () => {
    setAuthTokens(null)
    setUser(null)
    localStorage.removeItem('authTokens')
    window.location.href = '/sign-in'
  }

  const contextData: AuthContextType = {
    user,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  )
}
