const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

type ApiResponse<T> = T | { success?: boolean; data?: T; error?: { message?: string } }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const body = (await response.json()) as ApiResponse<T>
  if (!response.ok || (typeof body === 'object' && body !== null && 'success' in body && body.success === false)) {
    const error = typeof body === 'object' && body !== null && 'error' in body ? body.error?.message : undefined
    throw new Error(error ?? 'Something went wrong')
  }
  return typeof body === 'object' && body !== null && 'data' in body && body.data !== undefined ? body.data as T : body as T
}

export const api = {
  list: <T>(resource: string) => request<T[]>(`/${resource}`),
  create: <T>(resource: string, data: unknown) => request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: <T>(resource: string, id: string | number, data: unknown) => request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (resource: string, id: string | number) => request<void>(`/${resource}/${id}`, { method: 'DELETE' }),
  report: <T>(name: string) => request<T>(`/reports/${name}`),
}

export { API_URL }
