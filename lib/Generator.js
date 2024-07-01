const { getRepoList, getBranches } = require('./http')
const ora = require('ora')
const inquirer = require('inquirer')
const util = require('util')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk');
const downloadGitRepo = require('download-git-repo') // 不支持 Promise

function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
}

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
    await sleep(1000);
    return wrapLoading(message, fn, ...args);
  } 
}

class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  /* 获取用户选择的模板
  * 1）从远程拉取模板数据
  * 2）用户选择自己新下载的模板名称
  * 3）return 用户选择的名称
  */

  async getRepo() {

    const repoList = await wrapLoading(getRepoList, 'waiting fetch repository');
    if (!repoList) return;

    // 过滤我们需要的模板名称
    const tempRepos = repoList.filter(item => item.topics.length && item.topics.includes('template'))
    const repos = tempRepos.map(item => item.name);

    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'Please choose a repository to create project'
    })
    console.log(repo);
    return repo;
  }

  async getProjectTemp(repo) {

    const tempList = await wrapLoading(getBranches, 'waiting fetch template template', repo);
    if (!tempList) return;

    // 过滤仓库main分支
    const tempRepos = tempList.filter(item => item.name !== 'main')
    const temps = tempRepos.map(item => item.name);

    const { temp } = await inquirer.prompt({
      name: 'temp',
      type: 'list',
      choices: temps,
      message: 'Please choose a template to create project'
    })
    console.log(temp);
    return temp;
  }


  /* 下载远程模板
  *  1）拼接下载地址
  *  2）调用下载方法
  */
  async download(repo, branches = ''){
    const requestUrl = `zhan-hc/${repo}#${branches}`;
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }

  /* 修改package.json里的name
  */
  async updateInfo(projectName) {
    fs.readFile(`${projectName}/package.json`,(error,data) => {
      if (error) {
        console.log(chalk.red(`读取文件出错了`))
        process.exit()// 退出当前操作
      } else {
        //读取的data为buffer,需要转成js对象
        data = JSON.parse(data.toString())
        data.name = projectName
        fs.writeFile(`${projectName}/package.json`, JSON.stringify(data, '', 2), (error) => {
          if (error) {
            console.log(chalk.red('重写出错啦'))
          }
        })
      }
    })
  }

  /* 核心创建逻辑
  *  1）获取模板名称
  *  2）下载模板到模板目录
  *  3）模板使用提示
  */
  async create(){
    const repo = await this.getRepo()
    const temp = await this.getProjectTemp(repo)
    try{
      await this.download(repo, temp)
      await this.updateInfo(this.name)
      // 4）模板使用提示
      console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
      console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
      console.log('npm install && npm run dev\r\n')
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = Generator;