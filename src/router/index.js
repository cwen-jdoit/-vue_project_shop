import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

const Users = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
const Rights = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

const List = () =>
    import ( /* webpackChunkName: "List_Add" */ '../components/goods/List.vue')
const Add = () =>
    import ( /* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')

const Order = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/report/report.vue')



Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'
}, {
    path: '/login',
    component: Login
}, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
            path: '/welcome',
            component: Welcome
        }, {
            path: '/users',
            component: Users
        }, {
            path: '/rights',
            component: Rights
        }, {
            path: '/roles',
            component: Roles
        }, {
            path: '/categories',
            component: Cate
        }, {
            path: '/params',
            component: Params
        }, {
            path: '/goods',
            component: List
        }, {
            path: '/goods/add',
            component: Add
        }, {
            path: '/orders',
            component: Order
        },
        {
            path: '/reports',
            component: Report
        }
    ]
}]

const router = new VueRouter({
    routes
})

//@ 为路由对象添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
    // 如果用户访问登录页，直接放行
    if (to.path === '/login') return next()
        // 从sessionStorage中获取保存到的token值
    const tokenStr = sessionStorage.getItem('token')
        // 没有token跳转到登录页
    if (!tokenStr) return next('/login')
    next()
})

export default router