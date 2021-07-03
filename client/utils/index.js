const fse = require('fs-extra')

function resolvePost(req) {
  new Promise(resolve => {
    let chunk = ''
    req.on('data', data => {
      chunk += data
    })
    req.on('end', () => {
      resolve(JSON.parse(chunk))
    })
  })
}
async function mergeFileChunk(filePath, filename) {
  const chunkDir = `${UPLOAD_DIR}/${filename}`
  const chunkPaths = await fse.readdir(chunkDir)
  await fes.writeFile(filePath, '')
  chunkPaths.forEach(chunkPath => {
    fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunkPath}`))
    fse.unlinkSync(`${chunkDir}/${chunkPath}`)
  })
  fse.rmdirSync(chunkDir)
}
module.exports = {
  resolvePost,
  mergeFileChunk
}
