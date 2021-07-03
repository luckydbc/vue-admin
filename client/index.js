const http = require("http")
const path = require('path')
const fse = require('fs-extra')
const multiparty = require('multiparty')
const server = http.createServer()
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target') // 大文件存储目录

const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      fse.unlinkSync(path)
      resolve()
    })
    readStream.pipe(writeStream)
  })
const extractExt = filename =>
  filename.slice(filename.lastIndexOf("."), filename.length) // 提取后缀名
const resolvePost = req => {
  console.log('resolve', req.url)
  return new Promise(resolve => {
    let chunk = ''
    req.on('data', data => {
      console.log('onData', data)
      chunk += data
    })
    req.on('end', () => {
      console.log('onEnd', JSON.parse(chunk))
      resolve(JSON.parse(chunk))
    })
  })
}
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  const chunkPaths = await fse.readdir(chunkDir)
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  const writeList = chunkPaths.map((chunkPath, index) =>
    pipeStream(
      path.resolve(chunkDir, chunkPath),
      // 指定位置创建可写流
      fse.createWriteStream(filePath, {
        start: index * size,
        end: (index + 1) * size
      })
    )
  )
  await Promise.all(writeList);
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
}
// 返回已经上传切片名
const createUploadedList = async fileHash =>
  fse.existsSync(path.resolve(UPLOAD_DIR, fileHash)) ?
  await fse.readdir(path.resolve(UPLOAD_DIR, fileHash)) : [];
server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    res.status = 200
    res.end()
    return
  }
  // console.log(UPLOAD_DIR)
  // console.log(req)
  if (req.url === "/merge") {
    console.log('merge')
    const data = await resolvePost(req)
    const {
      filename,
      filehash,
      size
    } = data
    console.log('data =====', data)
    const ext = extractExt(filename)
    const filePath = path.resolve(UPLOAD_DIR, `${filehash}${ext}`)
    await mergeFileChunk(filePath, filehash, size)
    res.end(
      JSON.stringify({
        code: 0,
        message: "file merged success"
      })
    )
  }
  if (req.url === "/upload") {
    console.log('upload')
    const multipart = new multiparty.Form()
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.log('err ============================')
        return
      }
      const [chunk] = files.chunk
      const [hash] = fields.hash
      const [filename] = fields.filename
      const [filehash] = fields.filehash
      console.log(hash, filename, filehash)
      const filePath = path.resolve(
        UPLOAD_DIR,
        `${filehash}${extractExt(filename)}`
      )
      const chunkDir = `${UPLOAD_DIR}/${filehash}`
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir)
      }
      await fse.move(chunk.path, `${chunkDir}/${hash}`)
      res.end('received file chunk')
    })
  }
  if (req.url === '/verify') {
    console.log('verify')
    const data = await resolvePost(req)
    const {
      filehash,
      filename
    } = data
    const ext = extractExt(filename);
    const filePath = path.resolve(UPLOAD_DIR, `${filehash}${ext}`);
    if (fse.existsSync(filePath)) {
      res.end(
        JSON.stringify({
          shouldUpload: false
        })
      )
    } else {
      res.end(
        JSON.stringify({
          shouldUpload: true,
          uploadedList: await createUploadedList(filehash)
        })
      );
    }
  }
})


server.listen(3000, () => console.log("正在监听 3000 端口"))
