import { api } from '@/utils/api'
import {
  AffiliateProfileData,
  GetProfileResponse,
  UpdateProfileResponse,
  CreateAccountResponse,
  UploadDocumentsResponse,
  UpdateProfileData,
} from './types/profile.types'

export class ProfileService {
  public async getAffiliateProfile() {
    const controller = new AbortController()
    const URL = `/affiliates/profile`

    const { data: response, status } = await api<
      GetProfileResponse<AffiliateProfileData>
    >({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async createAccount(formData: FormData) {
    const controller = new AbortController()
    const URL = `/affiliates/profile/account`

    const { data: response, status } = await api<CreateAccountResponse>({
      url: URL,
      method: 'POST',
      data: formData,
      signal: controller.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return { response, status, controller }
  }

  public async uploadDocuments(formData: FormData) {
    const controller = new AbortController()
    const URL = `/affiliates/profile/documents`

    const { data: response, status } = await api<UploadDocumentsResponse>({
      url: URL,
      method: 'POST',
      data: formData,
      signal: controller.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return { response, status, controller }
  }

  public async updateAffiliateProfile(
    id: number,
    profileData: UpdateProfileData
  ) {
    const controller = new AbortController()
    const URL = `/affiliates/profile/${id}`

    const { data: response, status } = await api<UpdateProfileResponse>({
      url: URL,
      method: 'PATCH',
      data: profileData,
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}

export class LandingPageService {
  public async getLandingPageUrl() {
    const controller = new AbortController()
    const URL = `/lp-url`

    const { data: response, status }: { data: string; status: number } =
      await api({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        responseType: 'text',
      })

    let jsonData
    try {
      const jsonStartIndex = response.indexOf('{')
      if (jsonStartIndex !== -1) {
        jsonData = JSON.parse(response.substring(jsonStartIndex))
      } else {
        throw new Error('JSON não encontrado na resposta')
      }
    } catch (error) {
      console.error('Erro ao processar JSON da resposta:', error)
      jsonData = { data: { landing_page_url: '#' } }
    }
    return { response: jsonData, status, controller }
  }
}
