require('dotenv').config()
const config = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  allowedExtention: ['.xlsx', '.txt'],
  getUploadFilesDirectory: (process.env.NODE_ENV === 'development') ? 'uploads' : 'src/files',
  memoryReportFile: (process.env.NODE_ENV === 'development') ? 'memoryReportFile.csv' : (process.env.NODE_ENV === 'test' ? 'test.csv' : 'nofile.csv')
}
module.exports = config
