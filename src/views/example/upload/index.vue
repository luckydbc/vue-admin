<template>
  <div class="upload-page">
    <h3 class="title">文件上传</h3>
    <input placeholder="请选择文件"
           type="file"
           @change="selectFile">
    <el-button @click="doMerge"
               v-if="false">合并</el-button>
    <template v-if="fakeUploadPercentage">
      <h5>总进度</h5>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </template>
    <el-table :data="fileData">
      <el-table-column prop="hash"
                       label="切片hash"
                       align="center"></el-table-column>
      <el-table-column label="大小(KB)"
                       align="center"
                       width="120">
        <template v-slot="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
      <el-table-column label="进度"
                       align="center">
        <template v-slot="{ row }">
          <el-progress :text-inside="true"
                       :stroke-width="26"
                       :percentage="row.percentage || 0"
                       color="#409EFF"></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
// import axios from 'axios'
import CommonApi from '@/services/common'
import request from '@/utils/request'
const SIZE = 10 * 1024 * 1024 // 切片大小
export default {
  data() {
    return {
      file: null,
      hash: '',
      worker: null,
      fileData: [],
      hashPercentage: 0,
      fakeUploadPercentage: 0
    }
  },
  filters: {
    transformByte(val) {
      return Number((val / 1024).toFixed(0))
    }
  },
  computed: {
    uploadPercentage() {
      if (!this.file || !this.fileData.length) return 0
      const loaded = this.fileData
        .map(item => item.size * (item.percentage || 0))
        .reduce((acc, cur) => acc + cur)
      return parseInt((loaded / this.file.size).toFixed(2))
    }
  },
  // 防止续传百分比回退
  watch: {
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now
      }
    }
  },
  methods: {
    /**
     * 选中文件
     */
    selectFile(e) {
      const [file] = e.target.files
      if (!file) return
      this.file = file
      this.resetData()
      this.uploadFile()
    },
    /**
     * 文件修改重置默认
     */
    resetData() {
      if (this.worker) {
        this.worker.onmessage = null
      }
      this.hash = ''
      this.fileData = []
      this.hashPercentage = 0
    },
    /**
     * 文件上传
     */
    async uploadFile(file) {
      console.log('start upload')
      const fileChunkList = this.createFileChunk(this.file)
      this.hash = await this.calculateHash(fileChunkList)
      const res = await CommonApi.verifyUpload({
        filename: this.file.name,
        filehash: this.hash
      })
      console.log(res)
      const { shouldUpload, uploadedList = [] } = res.data
      if (!shouldUpload) {
        this.$message({
          type: 'success',
          message: '秒传：上传成功'
        })
        return
      }
      this.fileData = fileChunkList.map(({ file }, index) => ({
        fileHash: this.hash,
        chunk: file,
        index: index,
        size: file.size,
        hash: this.hash + '-' + index,
        percentage: uploadedList.includes(index) ? 100 : 0
      }))
      await this.uploadChunks(uploadedList)
    },
    /**
     * 计算文件hash值
     */
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({ fileChunkList })
        this.worker.onmessage = e => {
          const { percentage, hash } = e.data
          this.hashPercentage = percentage
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    /**
     * 生成文件切片
     */
    createFileChunk(file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) })
        cur += size
      }
      return fileChunkList
    },
    /**
     * 上传切片
     */
    async uploadChunks(uploadedList = []) {
      const requestList = this.fileData
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ chunk, hash, index }) => {
          const formData = new FormData()
          console.log(chunk, hash, this.file.name)
          formData.append('chunk', chunk)
          formData.append('hash', hash)
          formData.append('filehash', this.hash)
          formData.append('filename', this.file.name)
          return { formData, index }
        })
        .map(async ({ formData, index }) => {
          // axios({
          //   method: 'post',
          //   url: 'http://localhost:3000/upload',
          //   data: formData,
          //   headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded'
          //   }
          // })
          // request({
          //   url: 'http://localhost:3000',
          //   data: formData
          // })
          return CommonApi.uploadFile(formData, this.handelProcess(this.fileData[index]))
        })
      console.log(requestList)
      await Promise.all(requestList)
      if (uploadedList.length + requestList.length === this.fileData.length) {
        // this.mergeRequest()
        await request({
          url: 'http://localhost:3000/merge',
          headers: {
            'content-type': 'application/json'
          },
          data: JSON.stringify({
            size: SIZE,
            filename: this.file.name,
            filehash: this.hash
          })
        })
      }
      // await CommonApi.mergeFile(JSON.stringify({
      //   filename: this.file.name
      // }))
      // CommonApi.uploadFile(params).then(res => {
      //   console.log('res', res)
      // }).catch(err => {
      //   console.log('err', err)
      // })
    },
    /**
     * 执行合并请求
     */
    doMerge() {
      this.mergeRequest()
    },
    /**
     * 合并请求
     */
    async mergeRequest() {
      await request({
        url: 'http://localhost:3000/merge',
        headers: {
          'content-type': 'application/json'
        },
        data: JSON.stringify({
          size: SIZE,
          filename: this.file.name,
          filehash: this.hash
        })
      })
    },
    /**
     * 子进度工厂
     */
    handelProcess(item) {
      return (process) => {
        console.log('eeee', parseInt(String((process.loaded / process.total) * 100)))
        this.$set(item, 'percentage', parseInt(String((process.loaded / process.total) * 100)))
      }
    }
  }
}
</script>
