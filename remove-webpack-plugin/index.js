const fs = require('fs');
const path = require('path')
module.exports = class RemoveWebpackPlugin {
  constructor(options){
    this.options = options
  }

  // 清除文件夹
  clearDir(output){
    if(output.path){
      try {
        fs.statSync(output.path);
        this.clearFile(output)
      } catch (error) {
        // console.log(error)
        fs.mkdirSync(output.path);
      }
    }
  }

  // 清除文件
  clearFile(output){
    const { filename } = output
    let fileDir = path.join(output.path, filename);
    try {
      fs.statSync(fileDir);
      fs.unlinkSync(fileDir);
      fs.rmdirSync(output.path);
      fs.mkdirSync(output.path);
    } catch (error) {
      // console.log(error)
    }
  }
};