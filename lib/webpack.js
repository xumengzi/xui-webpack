const fs = require('fs');
const path = require('path');
// 使用babel相关的插件
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');

module.exports = class Webpack {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;

    this.modules = [];
  }

  run() {
    const info = this.parse(this.entry);

    // 递归处理其他模块
    this.modules.push(info);
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const { dependencies } = item;
      if (dependencies) {
        for (let j in dependencies) {
          let ele = this.parse(dependencies[j]);
          this.modules.push(ele)
        };
      };
    };

    const obj = {};
    this.modules.forEach(item => {
      const { dependencies, code } = item;
      obj[item.entryFile] = {
        dependencies,
        code
      };
    });

    this.file(obj);
  }

  parse(entryFile) {
    // 分析入口模块内容
    let content = fs.readFileSync(entryFile, 'utf-8');

    // 分析依赖, 以及依赖的路径
    // 用parser来生成AST
    let ast = parser.parse(content, {
      sourceType: 'module'
    });

    // 提取import语句
    const dependencies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        // 处理路径
        let pathName = './' + path.join(path.dirname(entryFile), node.source.value);
        dependencies[node.source.value] = pathName;
      }
    });

    // 处理内容 转换ast
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    });

    return {
      entryFile,
      dependencies,
      code
    }
  }

  file(code){
    // 生成文件 bundle.js => ./dist/main.js
    const filePath = path.join(this.output.path, this.output.filename);

    // 这一段太绕了
    const bundle = `(function(graph){
/*****/function require(module){
/******/function localRequire(relativePath){
/*********/return require(graph[module].dependencies[relativePath])
/******/}
/*******/var exports = {};
/******/(function(require, exports, code){
/*******/eval(code)
/******/})(localRequire, exports, graph[module].code);
/******/return exports;
/*****/};
/*****/require('${this.entry}');
/****/})(${JSON.stringify(code)});`;
    
    // 判断目录是否存在, 然后输出文件
    fs.stat(this.output.path, (error) =>{
      if(error){
        fs.mkdirSync(this.output.path);
        return;
      };
      fs.writeFileSync(filePath, bundle, 'utf-8');
    });
  }
}