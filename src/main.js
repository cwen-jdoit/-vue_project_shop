import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'

//cwen 富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

//cwen 富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token'); // 通过拦截器给请求头添加token
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