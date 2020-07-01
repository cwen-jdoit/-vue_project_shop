<template>
<!-- 登录组件 -->
    <div class="login_container">
        <!-- 登录框白色 -->
        <div class="login_box">
            <!-- 网站logo -->
            <div class="avater_box">
                <img src="../assets/images/logo.png" alt="">
            </div>
            <!-- 登录表单 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                <el-input v-model="loginForm.password" prefix-icon="iconfont icon-mima"></el-input>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item class="btns">
                <el-button type="primary" round @click="validateForm">登录</el-button>
                <el-button type="info" round @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            // todo 表单数据绑定
            loginForm:{
                username:'admin',
                password:'123456'
            },
            //todo 表单数据的验证
            rules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        //todo 重置表单数据(点击重置按钮)
        resetForm(){
           this.$refs.loginFormRef.resetFields();
        },
        // 表单预验证
        validateForm(){
            this.$refs.loginFormRef.validate(async result=>{
                //todo 验证通过发送登录请求(用message方法弹出提示框)
                if(!result) return
                //todo 发送axios请求（此时要配置axios）
                const { data:res} = await this.$http.post("login",this.loginForm);
                // console.log(res)
                if(res.meta.status != 200) return this.$message.error('用户名或密码有误！');
                this.$message.success('登陆成功');
                //@ 登陆成功后的token，保存到客户端sessionStorage中
                // 1.1 项目中除了登录之外的API只有登录之后才能访问
                // 1.2 token只有在当前网站打开期间生效，所以token保存在sessionStorage中
                window.sessionStorage.setItem("token",res.data.token);
                //@ 通过编程式导航跳转到后台主页，路由地址'/home'
                this.$router.push("/home");
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    height: 100%;
    background-color: #2b4b6b;
}
.login_box{
    width: 450px;
    height: 300px;
    border-radius: 5px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avater_box{
    width: 130px;
    height: 130px;
    padding: 10px;
    background-color: #ddd;
    border-radius: 50%;
    box-shadow: 0 0 10px black;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #fff;
    }
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
}
.btns{
    text-align: center;
}
</style>