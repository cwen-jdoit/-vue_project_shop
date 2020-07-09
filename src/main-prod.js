import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import NProgress from 'nprogress' //进度条

//cwen 富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

//cwen 富文本编辑器样式
import 'nprogress/nprogress.css' //季度条样式

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    NProgress.start(); //发送请求开始
    config.headers.Authorization = window.sessionStorage.getItem('token'); // 通过拦截器给请求头添加token
    return config
})

axios.interceptors.response.use(config => {
    NProgress.done(); //接收到响应结束
    return config
})

Vue.prototype.$http = axios
Vue.component('tree-table', ZkTable)
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.filter('dateFormate', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
        // padStart方法第一个参数表示返回字符串的个数，第二个参数表示不够需要补的字符串
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')