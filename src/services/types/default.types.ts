export interface DefaultResponse {
  success: boolean
  message: string
}

export interface ErrorResponse {
  errors?: Error
}

type Error = {
  [key: string]: string[]
}
