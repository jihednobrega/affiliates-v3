import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AcademyService } from '@/services/academy'
import { Training, AcademyStats } from '@/services/types/academy.types'

const academyService = new AcademyService()

export function useCategories() {
  return useQuery({
    queryKey: ['academy', 'categories'],
    queryFn: async () => {
      const { response, status } = await academyService.getCategories()
      if (status !== 200) {
        throw new Error(response?.message || 'Erro ao buscar categorias')
      }
      return response.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutos - categories mudam raramente
    gcTime: 30 * 60 * 1000, // 30 minutos na memória
    retry: 3,
    refetchOnWindowFocus: false, // Evita refetch desnecessário
    refetchOnMount: false, // Usa cache se disponível
  })
}

export function useTrainings(category?: string) {
  return useQuery({
    queryKey: ['academy', 'trainings', category],
    queryFn: async () => {
      const { response, status } = await academyService.getTrainings(category)
      if (status !== 200) {
        throw new Error(response?.message || 'Erro ao buscar treinamentos')
      }
      return response.data
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  })
}

export function useCompleteTraining() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trainingId: string) => {
      const { response, status } = await academyService.markTrainingComplete(
        trainingId
      )
      if (status !== 200) {
        throw new Error(
          (response as any)?.message ||
            'Erro ao marcar treinamento como completo'
        )
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'trainings'] })
    },
  })
}

export function useUpdateTrainingProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trainingId,
      progress,
    }: {
      trainingId: string
      progress: number
    }) => {
      const { response, status } = await academyService.updateTrainingProgress(
        trainingId,
        progress
      )
      if (status !== 200) {
        throw new Error(
          (response as any)?.message ||
            'Erro ao atualizar progresso do treinamento'
        )
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'trainings'] })
    },
  })
}

export function useAcademyStats() {
  const { data: trainingsData } = useTrainings()
  const { data: categories = [] } = useCategories()

  const trainings = trainingsData?.list || []

  const stats: AcademyStats = {
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter(
      (t: Training) => parseFloat(t.progress) >= 100
    ).length,
    totalCategories: categories.length,
    totalHours: 0,
    completedHours: 0,
  }

  return stats
}

export function useAcademy() {
  const categories = useCategories()
  const trainings = useTrainings()
  const completeTraining = useCompleteTraining()
  const updateProgress = useUpdateTrainingProgress()
  const stats = useAcademyStats()

  return {
    categories,
    trainings,
    completeTraining,
    updateProgress,
    stats,
    isLoading: categories.isLoading || trainings.isLoading,
    error: categories.error || trainings.error,
  }
}
