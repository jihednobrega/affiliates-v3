import { api } from '@/utils/api'

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    url: string
  }
}

export type UploadType = 'logo' | 'profile_pic' | 'doc' | 'banner' | 'video'

export class FilesService {
  async upload(formData: FormData) {
    const controller = new AbortController()
    const URL = '/upload'

    const { data: response, status } = await api<UploadResponse>({
      url: URL,
      method: 'POST',
      signal: controller.signal,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return { response, status, controller }
  }
}