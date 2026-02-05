import { http } from '@/services/http'

export const uploadImage = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  
  const response = await http.post('/cutout/segment', form, {
    responseType: 'blob',
    headers: {
      'Accept': 'image/png'
    }
  })
  return response
}
