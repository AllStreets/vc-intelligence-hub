import axios from 'axios'

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api`

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

export const fetchAPIStatus = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Error fetching API status:', error)
    return { status: 'error' }
  }
}

export const fetchTrends = async () => {
  try {
    const response = await api.get('/trends/scored')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch trends')
  }
}

export const fetchDeals = async () => {
  try {
    const response = await api.get('/deals')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch deals')
  }
}

export const fetchFounders = async () => {
  try {
    const response = await api.get('/founders')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch founders')
  }
}

export default api
