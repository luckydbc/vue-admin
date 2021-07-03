import axios from 'axios'
import config from '@/config'
const app = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: config.API_TIMEOUT,
  validateStatus: (status) => {
    return status < 500
  }
})

/**
 * 请求拦截
 */
app.interceptors.request.use((config) => {
  // config.headers.Authorization = 'token'
  return config
}, (err) => {
  console.log('req err', err)
  return Promise.reject(err)
})
/**
 * 返回数据的处理
 */
app.interceptors.response.use((res) => {
  console.log('response')
  if (res.status_code === 401) {
    console.log('重新认证')
    return
  }
  if (res.status_code === 200) {
    res.ok = true
  }
  return res
}, (err) => {
  console.log('res err', err)
  return Promise.reject(err)
})

export default app
