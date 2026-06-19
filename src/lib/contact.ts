export const contactEmail = 'thecodeforge@outlook.com'
export const contactPhones = ['+91 9781010283', '+91 6280962201']
export const web3FormsAccessKey = 'e9309d6c-966a-418a-9724-90d79afbef45'

type Web3FormsResponse = {
  success?: boolean
  message?: string
}

export async function submitContactForm(formData: FormData) {
  const payload = formData

  if (!payload.has('access_key')) {
    payload.append('access_key', web3FormsAccessKey)
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: payload,
  })

  const data = (await response.json()) as Web3FormsResponse

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Unable to send the message right now.')
  }

  return data
}
