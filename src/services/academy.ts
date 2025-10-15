import { api } from '@/utils/api'
import {
  GetCategoriesResponse,
  GetTrainingsResponse,
} from './types/academy.types'

export class AcademyService {
  public async getCategories() {
    const controller = new AbortController()
    const URL = '/affiliates/trainings/categories'

    const { data: response, status } = await api<GetCategoriesResponse>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async getTrainings(category?: string) {
    const controller = new AbortController()
    const URL = '/affiliates/trainings'

    if (category) {
      const apiFormatEncoded = encodeURIComponent(category).replace(/%20/g, '+')
      console.log('🎯 AcademyService.getTrainings - Categoria:', category)
      console.log('🔗 Standard encoding:', encodeURIComponent(category))
      console.log('🔗 API format encoding:', apiFormatEncoded)
    }

    const { data: response, status } = await api<GetTrainingsResponse>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
      params: category ? { category } : undefined,
    })

    return { response, status, controller }
  }

  public async markTrainingComplete(trainingId: string) {
    const controller = new AbortController()
    const URL = `/affiliates/trainings/${trainingId}/complete`

    const { data: response, status } = await api({
      url: URL,
      method: 'POST',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async updateTrainingProgress(trainingId: number, progress: string) {
    const controller = new AbortController()

    const URL = `/affiliates/trainings/${trainingId}`

    const { data: response, status } = await api({
      url: URL,
      method: 'POST',
      signal: controller.signal,
      data: { progress },
    })

    return { response, status, controller }
  }
}
