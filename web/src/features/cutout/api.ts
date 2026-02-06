import { http } from '@/services/http'

export const uploadImage = async (file: File): Promise<Blob> => {
  const form = new FormData()
  form.append('file', file)

  return await http.post('/cutout/segment', form, {
    responseType: 'blob',
    headers: {
      'Accept': 'image/png'
    }
  })
}
