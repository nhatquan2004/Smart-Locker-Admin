class ApiService {
    private readonly baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            throw new Error(`[${response.status}] ${response.statusText}`)
        }

        return response.json() as Promise<T>
    }

    async get<T>(path: string): Promise<T> {
        const response = await fetch(this.baseUrl + path, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return this.handleResponse<T>(response)
    }

    async post<T>(path: string, data: unknown): Promise<T> {
        const response = await fetch(this.baseUrl + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        return this.handleResponse<T>(response)
    }
}

export const apiService = new ApiService()
