export function getYouTubeVideoId(url: string): string | null {
  // Regex para extrair o ID do vídeo
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|\.be\/)([a-zA-Z0-9_-]{11})/
  )

  // Se encontrar o ID do vídeo, retorna o ID
  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1]
    return videoId
  }

  return null
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  return null
}
