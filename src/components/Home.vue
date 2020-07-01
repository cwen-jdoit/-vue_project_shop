<template>
  <el-container class="homeBox">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/images/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>
    </el-header>
    <!-- 导航栏区域 -->
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠按钮（手动编写） -->
        <div class="toggleBtn" @click="toggleMenu">
          <i class="el-icon-s-operation"></i>
        </div>
        <!-- 菜单栏区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          router
          :collapse-transition="false"
          :collapse="isCollapse"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- v-for 动态循环遍历，注意属性index需要字符串格式 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <!-- 路由填充位 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //todo 左侧菜单栏数据
      menulist: [],
      iconObj: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-s-order',
        '101': 'el-icon-s-shop',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-data'
      },
      //todo 是否折叠
      isCollapse: false,
      //todo 激活二级路由样式
      activePath: ''
    };
  },
  created() {
    //todo   生命周期函数，页面加载获取数据
    this.getMenuList();
    //todo 动态获取当前index的值
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    loginout() {
      //todo 清除token并重定向到登录页
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    //todo 获取菜单栏数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      // console.log(res.data);
    },
    toggleMenu() {
      //todo 折叠菜单
      this.isCollapse = !this.isCollapse;
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.homeBox {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  > div {
    display: flex;
    width: 500px;
    height: 100%;
    align-items: center;
    img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      box-shadow: 0 0 10px #fff;
      margin-right: 20px;
      overflow: hidden;
    }
    span {
      font-size: 20px;
      color: #fff;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggleBtn {
  background-color: #4a5064;
  color: #fff;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
}
</style>