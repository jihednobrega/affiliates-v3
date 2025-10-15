import { api } from '@/utils/api'

export interface InviteResponse {
  success: boolean
  message: string
  data?: any
}

export interface ValidateTokenResponse {
  success: boolean
  message: string
  data: {
    email: string
  }
}

export class InvitesService {
  public async validateToken(token: string) {
    const controller = new AbortController()

    const { data: response, status } = await api<ValidateTokenResponse>({
      url: `/invites/validate-token?token=${token}`,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async sendInvites(emails: string) {
    const controller = new AbortController()

    const { data: response, status } = await api<InviteResponse>({
      url: `/affiliates/invites`,
      method: 'POST',
      data: { emails },
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async registerUser(token: string, request: { name: string }) {
    const controller = new AbortController()

    const { data: response, status } = await api<InviteResponse>({
      url: `/invites/register-user?token=${token}`,
      method: 'POST',
      data: request,
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async getInvites() {
    const controller = new AbortController()

    const { data: response, status } = await api<InviteResponse>({
      url: `/affiliates/invites`,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}
