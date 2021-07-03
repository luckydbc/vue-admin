import Base from '../base'
class CommonApi extends Base {
  constructor() {
    super()
    this.uploadFileUrl = '/upload'
    this.mergeFileUrl = '/merge'
    this.verifyUploadUrl = '/verify'
  }
  /**
   * 文件上传接口
   * @param {*} params
   * @param {*} onUploadProgress 进度函数
   * @returns
   */

  uploadFile(params, onUploadProgress) {
    console.log('upload file', params)
    return this.sendPost(this.uploadFileUrl, params, {
      onUploadProgress
    })
  }

  /**
   * 文件合并
   * @param {*} params
   * @returns
   */

  mergeFile(params) {
    return this.sendPost(this.mergeFileUrl, params).then(res => {
      return res
    })
  }

  /**
   * 上传文件校验
   * @param {*} params
   */

  verifyUpload(params) {
    return this.sendPost(this.verifyUploadUrl, params).then(res => {
      return res
    })
  }
}
export default new CommonApi()
