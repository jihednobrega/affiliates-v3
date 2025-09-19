import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Auth } from '@/services/auth'
import { AuthSigninRequest } from '@/services/types/auth.types'
import { useMutation } from '@tanstack/react-query'
import Cookie from 'js-cookie'
import { AxiosError } from 'axios'
import {
  AuthContextProps,
  Brand,
  Role,
  SigninOptions,
  User,
} from '@/types/auth-context-types'

const authContext = createContext({} as AuthContextProps)

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const auth = useMemo(() => new Auth(), [])
  const router = useRouter()

  const [isLoggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<User>(() => {
    const cookie = Cookie.get('affiliates-token')
    return {
      name: null,
      email: null,
      avatar: null,
      role: null,
      showedPopUp: null,
      token: cookie || null,
      currentBrandId: null,
      app_version: null,
    }
  })
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandVendor, setBrandVendor] = useState<string>('')

  const currentBrand = useMemo(() => {
    if (!user.currentBrandId) return undefined
    return brands.find((brand) => brand.id === user.currentBrandId)
  }, [brands, user.currentBrandId])

  const { mutate: signin, isPending: signinPending } = useMutation({
    mutationKey: ['user'],
    mutationFn: auth.signin.bind(auth),
  })

  const { mutate: header, isPending: headerPending } = useMutation({
    mutationKey: ['header'],
    mutationFn: auth.getUserInfo.bind(auth),
  })

  const isLoading = useMemo(
    () => signinPending || headerPending,
    [signinPending, headerPending]
  )

  function handleSetLoggedIn(value: boolean) {
    setLoggedIn(value)
  }

  function handleSetUser(field: Partial<User>) {
    setUser((state) => ({ ...state, ...field }))
  }

  function handleSetBrands(brand: Brand) {
    const brandIndex = brands.findIndex((brand_) => brand_.id === brand.id)
    if (brandIndex < 0) {
      setBrands((brands) => [...brands, brand])
    } else {
      setBrands((brands) => {
        brands[brandIndex] = brand
        return [...brands]
      })
    }
  }

  function handleRemoveBrand(id: number) {
    setBrands((brands) => brands.filter((brand) => brand.id !== id))
  }

  function signout() {
    handleSetUser({
      email: null,
      name: null,
      showedPopUp: null,
      role: null,
      token: null,
    })
    setBrands([])
    setLoggedIn(false)
    auth.singout()
    Cookie.remove('affiliates-token')
    router.push('/login?not_loggedin=true')
  }

  function handleSignin(
    values: AuthSigninRequest,
    { onError, onSuccess, redirect = true }: SigninOptions
  ) {
    signin(values, {
      onSuccess(data) {
        const { response } = data
        const token = response?.data?.token

        if (!token) throw new Error('Token inválido.')

        const roleMap: Record<string, Role> = {
          affiliate: 'affiliate',
          referral: 'affiliate',
          brand: 'brand',
          agent: 'brand',
          seller: 'brand',
          accountant: 'accountant',
        }
        const role = roleMap[response.data.role] as Role

        handleSetUser({
          email: values.email,
          name: response.data.name,
          role,
          token,
        })

        Cookie.set('affiliates-token', token)

        getUserInfo(false)
        onSuccess?.(response)

        if (redirect) {
          const pathMap = {
            affiliate: '/affiliate/dashboard',
            brand: '/brand/dashboard',
            accountant: '/accountant/dashboard',
          }
          router.push(pathMap[role as keyof typeof pathMap] || '/dashboard')
        }
      },
      onError(error) {
        onError?.(error as AxiosError)
      },
    })
  }

  function getUserInfo(redirect?: boolean) {
    header(null, {
      onSuccess(data) {
        const {
          avatar,
          brand,
          name,
          available_brands,
          balance,
          code,
          app_version,
        } = data.response.data

        setBrandVendor(brand.vendor)

        const roleMap: Record<string, Role> = {
          affiliate: 'affiliate',
          referral: 'affiliate',
          brand: 'brand',
          agent: 'brand',
          seller: 'brand',
          accountant: 'accountant',
        }
        const role = roleMap[data.response.data.role] as Role

        handleSetUser({
          avatar,
          name,
          code,
          showedPopUp: false,
          balance,
          role,
          currentBrandId: brand.id,
          app_version,
        })

        if (available_brands) {
          available_brands.forEach((brand: Brand) => handleSetBrands(brand))
        }
        handleSetBrands(brand)
        setLoggedIn(true)

        if (redirect) {
          const pathMap = {
            affiliate: '/affiliate',
            brand: '/brand',
            accountant: '/accountant',
          }
          router.push(pathMap[role as keyof typeof pathMap] || '/dashboard')
        }
      },
      onError() {
        signout()
      },
    })
  }

  function checkIfLoggedIn() {
    const token = Cookie.get('affiliates-token')
    const currentPath = router.asPath.split('?')[0]
    const publicPaths = ['/login', '/register']
    const isInPublicPage = publicPaths.some((path) =>
      currentPath.startsWith(path)
    )
    const isInHomePage = currentPath === '/' || router.asPath === '/'

    if (token) {
      getUserInfo(isInPublicPage)
      return
    }

    if (isInPublicPage) {
      return
    }

    if (isInHomePage) {
      router.push('/login')
      return
    }

    signout()
  }

  useEffect(() => {
    if (!router.isReady) return
    checkIfLoggedIn()
  }, [router.isReady])

  return (
    <authContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        brands,
        currentBrand,
        setBrand: handleSetBrands,
        removeBrand: handleRemoveBrand,
        brandVendor,
        isLoggedIn,
        setLoggedIn: handleSetLoggedIn,
        signin: handleSignin,
        signout,
        isLoading,
      }}
    >
      {children}
    </authContext.Provider>
  )
}

export { authContext, AuthProvider }
