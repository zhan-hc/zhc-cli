// lib/http.js

// 通过 axios 处理请求
const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data;
})


/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get('https://api.github.com/users/zhan-hc/repos')
}

/**
 * 获取仓库分支
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function  getBranches(repo) {
  return axios.get(`https://api.github.com/repos/zhan-hc/${repo}/branches`)
}

module.exports = {
  getRepoList,
  getBranches
}