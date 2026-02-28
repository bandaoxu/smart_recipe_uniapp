import request from './request'

export const getDiaryByDate = (date) =>
  request({ url: '/nutrition/diary/', method: 'GET', data: { date } })

export const addDiaryRecord = (data) =>
  request({ url: '/nutrition/diary/', method: 'POST', data })

export const deleteDiaryRecord = (id) =>
  request({ url: `/nutrition/diary/${id}/`, method: 'DELETE' })

export const getNutritionReport = (period = 'week') =>
  request({ url: '/nutrition/report/', method: 'GET', data: { period } })

export const getNutritionAdvice = () =>
  request({ url: '/nutrition/advice/', method: 'GET' })
