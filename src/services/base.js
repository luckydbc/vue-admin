import api from './api'
class Base {
  /**
   * Get请求
   * @param { String } url
   * @param { Object } params
   * @param { Boolean } mute 是否loading，默认false
   */

  sendGet(url, params, mute = false) {
    // 根据业务决定是否不显示loading
    return api.get(url, {
      params
    }).then(response => {
      return response
    }).catch(() => {
      return {
        ok: false
      }
    })
  }

  /**
   * Post 请求
   * @param { String } url
   * @param { Object} data
   * @params { Object } config
   */

  sendPost(url, data, config) {
    return api.post(url, data, config).then(response => {
      return response
    }).catch(() => {
      return {
        ok: false
      }
    })
  }

  /**
   * service 中处理错误信息，一般在 新增，修改，删除等操作中调用
   * @param { res.data } data response 中的data
   * @param { success | error | errorOnly } options 成功或失败的 msg, errorOnly 只提示错误消息
   */
  handleError(data, options = {}) {
    if (data.ok) {
      !options.errorOnly && this.$message(options.success || '操作成功')
    } else {
      this.$message(data.message || options.error || '网络错误')
    }
  }

  /**
   * url替换工具方法
   * /test/{name} => /test/savo
   * @param { String } url 传入的 url 地址
   * @param { Object } params 要替换的参数
   */
  parseUrl(url, params) {
    Object.keys(params).forEach(key => {
      var reg = new RegExp('\\{' + key + '\\}')
      url = url.replace(reg, params[key])
    })
    return url
  }
}
export default Base
