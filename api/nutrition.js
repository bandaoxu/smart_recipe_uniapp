import request from './request'

export const getDiaryByDate = (date) =>
  request({ url: '/nutrition/diary/', method: 'GET', params: { date } })

export const addDiaryRecord = (data) =>
  request({ url: '/nutrition/diary/', method: 'POST', data })

export const deleteDiaryRecord = (id) =>
  request({ url: `/nutrition/diary/${id}/`, method: 'DELETE' })

export const updateDiaryRecord = (id, data) =>
  request({ url: `/nutrition/diary/${id}/`, method: 'PATCH', data })

export const getNutritionReport = (period = 'week') =>
  request({ url: '/nutrition/report/', method: 'GET', params: { period } })

export const getNutritionAdvice = () =>
  request({ url: '/nutrition/advice/', method: 'GET' })

export const getRecipeNutrition = (recipeId) =>
  request({ url: `/nutrition/recipe/${recipeId}/`, method: 'GET', needAuth: false })
