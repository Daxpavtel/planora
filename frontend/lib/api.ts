const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper for fetch with auth token and error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('planora_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type']
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`)
    }
    return data
  } catch (err: any) {
    console.warn(`API Error [${endpoint}]:`, err.message)
    throw err
  }
}

// ----------------- CITIES API -----------------
export const citiesApi = {
  async getAll(params?: {
    search?: string
    country?: string
    region?: string
    sort?: string
    budget?: string
    min_cost?: number
    max_cost?: number
  }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.country && params.country !== 'All') query.set('country', params.country)
    if (params?.region && params.region !== 'All') query.set('region', params.region)
    if (params?.sort) query.set('sort', params.sort)
    if (params?.budget && params.budget !== 'Any') query.set('budget', params.budget)
    if (params?.min_cost !== undefined) query.set('min_cost', String(params.min_cost))
    if (params?.max_cost !== undefined) query.set('max_cost', String(params.max_cost))

    const qs = query.toString() ? `?${query.toString()}` : ''
    const res = await request<{ success: boolean; count: number; data: any[] }>(`/cities${qs}`)
    return res.data
  },

  async getById(id: string | number) {
    const res = await request<{ success: boolean; data: any }>(`/cities/${id}`)
    return res.data
  },

  async getSaved() {
    const res = await request<{ success: boolean; count: number; data: any[] }>(`/cities/saved`)
    return res.data
  },

  async toggleSave(cityId: string | number) {
    const res = await request<{ success: boolean; saved: boolean; message: string }>(
      `/cities/${cityId}/save`,
      { method: 'POST' },
    )
    return res
  },

  async removeSaved(cityId: string | number) {
    const res = await request<{ success: boolean; saved: boolean; message: string }>(
      `/cities/${cityId}/save`,
      { method: 'DELETE' },
    )
    return res
  },
}

// ----------------- ACTIVITIES API -----------------
export const activitiesApi = {
  async getAll(params?: {
    city_id?: string | number
    city?: string
    category?: string
    type?: string
    search?: string
    min_cost?: number
    max_cost?: number
    sort?: string
  }) {
    const query = new URLSearchParams()
    if (params?.city_id) query.set('city_id', String(params.city_id))
    if (params?.city) query.set('city', params.city)
    if (params?.category && params.category !== 'All') query.set('category', params.category)
    if (params?.type && params.type !== 'All') query.set('type', params.type)
    if (params?.search) query.set('search', params.search)
    if (params?.min_cost !== undefined) query.set('min_cost', String(params.min_cost))
    if (params?.max_cost !== undefined) query.set('max_cost', String(params.max_cost))
    if (params?.sort) query.set('sort', params.sort)

    const qs = query.toString() ? `?${query.toString()}` : ''
    const res = await request<{ success: boolean; count: number; data: any[] }>(`/activities${qs}`)
    return res.data
  },

  async getQuickView(id: string | number) {
    const res = await request<{ success: boolean; data: any }>(`/activities/${id}`)
    return res.data
  },

  async create(data: FormData | any) {
    const isFormData = data instanceof FormData
    const res = await request<{ success: boolean; data: any }>(`/activities`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    })
    return res.data
  },
}

// ----------------- TRIPS & ITINERARY API -----------------
export const tripsApi = {
  async getAll() {
    const res = await request<{ success: boolean; count: number; data: any[] }>(`/trips`)
    return res.data
  },

  async getById(id: string | number) {
    const res = await request<{ success: boolean; data: any }>(`/trips/${id}`)
    return res.data
  },

  async create(tripData: {
    trip_name: string
    start_date: string
    end_date: string
    description?: string
    cover_photo_url?: string
    stops?: any[]
    style?: string
  }) {
    const res = await request<{ success: boolean; data: any }>(`/trips`, {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
    return res.data
  },

  async update(id: string | number, data: any) {
    const res = await request<{ success: boolean; message: string }>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res
  },

  async delete(id: string | number) {
    const res = await request<{ success: boolean; message: string }>(`/trips/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  async addStop(tripId: string | number, stopData: { city_id: number | string; arrival_date?: string; departure_date?: string }) {
    const res = await request<{ success: boolean; data: any }>(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    })
    return res.data
  },

  async reorderStops(tripId: string | number, order: (number | string)[]) {
    const res = await request<{ success: boolean; message: string }>(`/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ order }),
    })
    return res
  },

  async removeStop(tripId: string | number, stopId: string | number) {
    const res = await request<{ success: boolean; message: string }>(`/trips/${tripId}/stops/${stopId}`, {
      method: 'DELETE',
    })
    return res
  },

  async scheduleActivity(
    tripId: string | number,
    data: { stop_id?: number | string; activity_id: number | string; scheduled_date?: string; sequence_order?: number },
  ) {
    const res = await request<{ success: boolean; data: any }>(`/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async unscheduleActivity(tripId: string | number, itineraryActivityId: string | number) {
    const res = await request<{ success: boolean; message: string }>(
      `/trips/${tripId}/activities/${itineraryActivityId}`,
      { method: 'DELETE' },
    )
    return res
  },
}

// ----------------- BUDGET & EXPENSES API (STRICT 4 BUCKETS) -----------------
export const expensesApi = {
  async getBudget(tripId: string | number) {
    const res = await request<{
      success: boolean
      data: {
        trip_id: number
        trip_name: string
        target_budget: number
        total_spent: number
        remaining_budget: number
        percentage_used: number
        categories: {
          Transport: number
          Stay: number
          Activities: number
          Meals: number
        }
        budgetByCategory: { category: string; amount: number; fill: string }[]
        dailySpend: { day: string; date: string; amount: number }[]
        budgetByCity: { city: string; nights: number; amount: number; share: number }[]
      }
    }>(`/trips/${tripId}/budget`)
    return res.data
  },

  async getExpenses(tripId: string | number) {
    const res = await request<{ success: boolean; count: number; data: any[] }>(
      `/trips/${tripId}/expenses`,
    )
    return res.data
  },

  async addExpense(
    tripId: string | number,
    expenseData: {
      category: 'Transport' | 'Stay' | 'Activities' | 'Meals'
      amount: number
      expense_date?: string
    },
  ) {
    const res = await request<{ success: boolean; data: any }>(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    })
    return res.data
  },

  async deleteExpense(expenseId: string | number) {
    const cleanId = String(expenseId).replace('e-', '')
    const res = await request<{ success: boolean; message: string }>(`/expenses/${cleanId}`, {
      method: 'DELETE',
    })
    return res
  },
}

// ----------------- AUTH & PROFILE API -----------------
export const authApi = {
  async register(userData: any) {
    const res = await request<{ success: boolean; token: string; user: any }>(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('planora_token', res.token)
    }
    return res
  },

  async login(credentials: { email: string; password: string }) {
    const res = await request<{ success: boolean; token: string; user: any }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('planora_token', res.token)
    }
    return res
  },

  async getMe() {
    const res = await request<{ success: boolean; user: any }>(`/auth/me`)
    return res.user
  },

  async updateProfile(profileData: any) {
    const res = await request<{ success: boolean; message: string }>(`/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
    return res
  },
}

// ----------------- COMMUNITY & ADMIN API -----------------
export const communityApi = {
  async getTrips() {
    const res = await request<{ success: boolean; count: number; data: any[] }>(`/community/trips`)
    return res.data
  },

  async addReview(tripId: string, reviewData: { rating: number; comment: string; user?: string }) {
    const res = await request<{ success: boolean; data: any }>(`/community/trips/${tripId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
    return res.data
  },
}

export const adminApi = {
  async getMetrics() {
    const res = await request<{ success: boolean; data: any }>(`/admin/metrics`)
    return res.data
  },
}
