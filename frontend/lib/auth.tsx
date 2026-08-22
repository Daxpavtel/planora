'use client'

import * as React from 'react'

export type UserProfile = {
  id?: string | number
  name: string
  firstName: string
  lastName?: string
  initials: string
  email: string
  homeCity: string
  currency: string
  role?: string
  photoUrl?: string
}

export const defaultUser: UserProfile = {
  id: 1,
  name: 'Yash Mehta',
  firstName: 'Yash',
  lastName: 'Mehta',
  initials: 'YM',
  email: 'yash.mehta@example.com',
  homeCity: 'Ahmedabad, India',
  currency: 'INR',
  role: 'Trip Architect',
  photoUrl: '/images/udaipur.png',
}

interface AuthContextValue {
  user: UserProfile
  login: (userData: Partial<UserProfile> & { email: string; name?: string }) => void
  register: (userData: {
    firstName: string
    lastName?: string
    email: string
    homeCity?: string
    country?: string
  }) => void
  updateProfile: (data: Partial<UserProfile>) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'planora_current_user'

function computeInitials(first: string, last?: string): string {
  const f = first.trim()[0] || 'U'
  const l = (last || '').trim()[0] || ''
  return (f + l).toUpperCase()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile>(defaultUser)

  // Safe client-side hydration from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.email) {
          setUser(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const saveUser = React.useCallback((updated: UserProfile) => {
    setUser(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }, [])

  const login = React.useCallback(
    (userData: Partial<UserProfile> & { email: string; name?: string }) => {
      const email = userData.email
      let fullName = userData.name
      if (!fullName) {
        // Derive friendly name from email if not provided
        const prefix = email.split('@')[0]
        fullName = prefix
          .split(/[._-]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
      }
      const parts = fullName.trim().split(' ')
      const firstName = parts[0] || 'Traveler'
      const lastName = parts.slice(1).join(' ') || ''
      const initials = computeInitials(firstName, lastName)

      const newUser: UserProfile = {
        ...defaultUser,
        ...userData,
        email,
        name: fullName,
        firstName,
        lastName,
        initials,
      }
      saveUser(newUser)
    },
    [saveUser],
  )

  const register = React.useCallback(
    (userData: {
      firstName: string
      lastName?: string
      email: string
      homeCity?: string
      country?: string
    }) => {
      const firstName = userData.firstName.trim() || 'Traveler'
      const lastName = (userData.lastName || '').trim()
      const fullName = `${firstName} ${lastName}`.trim()
      const initials = computeInitials(firstName, lastName)
      const homeCity = userData.homeCity
        ? `${userData.homeCity}${userData.country ? `, ${userData.country}` : ''}`
        : 'Mumbai, India'

      const newUser: UserProfile = {
        id: Date.now(),
        name: fullName,
        firstName,
        lastName,
        initials,
        email: userData.email,
        homeCity,
        currency: 'INR',
        role: 'Traveler',
        photoUrl: '/images/udaipur.png',
      }
      saveUser(newUser)
    },
    [saveUser],
  )

  const updateProfile = React.useCallback(
    (data: Partial<UserProfile>) => {
      setUser((prev) => {
        let firstName = data.firstName ?? prev.firstName
        let lastName = data.lastName ?? prev.lastName
        let name = data.name
        if (!name && (data.firstName || data.lastName)) {
          name = `${firstName} ${lastName || ''}`.trim()
        } else if (name && !data.firstName) {
          const parts = name.trim().split(' ')
          firstName = parts[0]
          lastName = parts.slice(1).join(' ')
        }

        const initials = computeInitials(firstName, lastName)
        const updated: UserProfile = {
          ...prev,
          ...data,
          name: name || prev.name,
          firstName,
          lastName,
          initials,
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
    },
    [],
  )

  const logout = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setUser(defaultUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
