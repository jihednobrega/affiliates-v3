import { api } from '@/utils/api'
import {
  AuthHeaderResponse,
  AuthSigninRequest,
  AuthSigninResponse,
  Brand,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './types/auth.types'

export class Auth {
  constructor(
    private name: string = '',
    private email: string = '',
    private role: string = '',
    private token: string = '',
    private avatar: string = '',
    private code: string = '',
    private brand: Brand | null = null,
    private balance: number = 0,
    private available_brands: Brand[] = [],
    private vendor: string = ''
  ) {}

  public getName() {
    return this.name
  }
  public getEmail() {
    return this.email
  }
  public getRole() {
    return this.role
  }
  public getToken() {
    return this.token
  }
  public getAvatar() {
    return this.avatar
  }
  public getCode() {
    return this.code
  }
  public getBrand() {
    return this.brand
  }
  public getBalance() {
    return this.balance
  }
  public getBrands() {
    return this.available_brands
  }
  public getVendor() {
    return this.vendor
  }

  public async signin({ email, ...rest }: AuthSigninRequest) {
    const controller = new AbortController()
    const URL = '/signin'
    const formattedEmail = email.toLocaleLowerCase()

    const request = {
      email: formattedEmail,
      ...rest,
    }

    function getUniqueUrl(url: string) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}_=${(Math.random() * 10).toFixed(0)}`
    }

    const { data: response, status } = await api<AuthSigninResponse>({
      url: getUniqueUrl(URL),
      method: 'POST',
      data: request,
      signal: controller.signal,
    })

    if (status == 200) {
      const { token, role } = response.data
      this.email = request.email
      this.token = token
      this.role = role
    }

    return { response, status, controller }
  }

  public singout() {
    this.name = ''
    this.email = ''
    this.role = ''
    this.avatar = ''
    this.code = ''
    this.brand = null
    this.balance = 0
    this.available_brands = []
  }

  public async getUserInfo(_: any) {
    const controller = new AbortController()
    const URL = '/header'

    function getUniqueUrl(url: string) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}_=${(Math.random() * 10).toFixed(0)}`
    }

    const { data: response, status } = await api<AuthHeaderResponse>({
      url: getUniqueUrl(URL),
      method: 'GET',
      signal: controller.signal,
    })

    if (status === 200) {
      const {
        avatar,
        brand,
        name,
        available_brands = [],
        balance = 0,
        code = '',
        role,
      } = response.data

      this.avatar = avatar
      this.brand = brand
      this.name = name
      this.available_brands = available_brands
      this.balance = balance
      this.code = code
      this.role = role
      this.vendor = brand.vendor
    }

    return {
      response,
      status,
      controller,
      vendor: response.data.brand.vendor,
    }
  }

  public async forgotPassword(request: ForgotPasswordRequest) {
    const controller = new AbortController()
    const URL = '/forgot-password'

    const { data: response, status } = await api<ForgotPasswordResponse>({
      url: URL,
      method: 'POST',
      data: request,
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async resetPassword(request: ResetPasswordRequest) {
    const controller = new AbortController()
    const URL = '/reset-password'

    const { data: response, status } = await api<ResetPasswordResponse>({
      url: URL,
      method: 'POST',
      data: request,
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}
