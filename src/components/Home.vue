<template>
    <div>
        <el-button type="info" @click="loginout">退出</el-button>
    </div>
</template>

<script>
export default {
    methods:{
        loginout(){
            // 清除token并重定向到登录页
            window.sessionStorage.clear();
            this.$router.push("/login");
        }
    }
}
</script>

<style lang="less" scoped>

</style>