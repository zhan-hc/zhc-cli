# zhc-cli
项目模板脚手架

## 使用方式
```
npm install zhc-cli -g
zhc create <project-name>
```

## Commands:
-  create [options] <app-name>  create a new project
-  help [command]               display help for command

* vue3-ts-template => 封装好axios请求和数据mock

## 默认模板

1. 封装好axios请求，格式 `const [err,res] = await getApi()`
2. 请求mock数据，执行 `yarn serve:mock`

## 移动端模板

### 功能
- vue3 + vue-router + pinia
- axios + scss + vant
- 移动端适配方案（postcss-pxtorem + amfe-flexible）
- 初始化css(normalize.css)


#### 接口封装axios
axios调用demo
```
  const [e, r] = await api.getUserInfo(userid)
  if (!e && r) this.userInfo = r.data.userinfo
```

#### 样式style
适用的是 `sass` ，src/assets/style/mixin.scss中定义了sass变量可以全局引用