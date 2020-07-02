<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-button type="primary">添加角色</el-button>
      <!-- 数据表格 -->
      <el-table :data="rolesList" style="width:100%" stripe border>
        <!-- 展开查看具体权限ui -->
        <el-table-column type="expand" label="@">
          <template slot-scope="scope">
            <!-- 循环角色信息，分配权限 -->
            <el-row
              :class="['bottomborder',index==0 ? 'topborder' : '','vcenter']"
              v-for="(item,index) in scope.row.children"
              :key="item.id"
            >
              <!-- 一级权限分布 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级其权限分布 -->
              <el-col :span="19">
                <el-row
                  :class="[index === 0 ? '' : 'topborder','vcenter']"
                  v-for="(item2,index) in item.children"
                  :key="item2.id"
                >
                  <!-- 二级权限展示 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限展示 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showDialogRight(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限弹出框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="dialogVisibleRight"
      width="50%"
      @close="rightDialogClosed"
    >
      <span>
        <el-tree
          :data="rightsList"
          :props="propsRight"
          show-checkbox
          default-expand-all
          node-key="id"
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRight = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  //cwen 生命周期函数获取角色数据
  created() {
    this.getRolesList();
  },
  data() {
    return {
      // 角色数据列表
      rolesList: [],
      // 分配权限显示否
      dialogVisibleRight: false,
      // 权限数据列表
      rightsList: [],
      // 树形控件属性绑定对象
      propsRight: {
        label: 'authName',
        children: 'children'
      },
      // 已经勾选的权限
      defKeys: [],
      // 用户id(分配权限时用，此处在点击分配权限按钮式为其赋值)
      roleId:''
    };
  },
  methods: {
    //cwen 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.rolesList = res.data;
    },
    //cwen 监听哪个权限需要删除
    async deleteRightById(role, id) {
      // 弹出删除提示框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除');
      }
      // 如果确定就发送删除请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败');
      }
      this.$message.success('删除成功');
      //@ 避免展开框合上，此处直接把获取到的数据给role
      role.children = res.data;
    },
    //cwen 监听点击分配权限按钮
    async showDialogRight(role) {
      // 拿到需要分配用户的id
      this.roleId = role.id;
      // 打开之前获取权限数据并复制给数据数组
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限信息失败');
      }
      this.rightsList = res.data;
      //@ 调用函数拿到已有的权限(注意此处传入的为role角色)
      this.getLeafKeys(role, this.defKeys);
      this.dialogVisibleRight = true;
    },
    //cwen 用函数递归读取所有已有的三级权限
    getLeafKeys(node, arr) {
      // 如果node不含children,就说明为三级权限
      if (!node.children) {
        return arr.push(node.id);
      }
      // 如果含children，就用它的孩子重新执行该函数
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    //cwen 监听弹出框关闭事件（关闭后清空已有权限数组）
    rightDialogClosed() {
      this.defKeys = []
    },
    //cwen 监听分配权限弹出框的确认按钮
    async allotRights(){
      // 拿到半选中的id以及全选中状态的id（剩余参数法拼接两个数组）
      const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()];
      // 数组转换成字符串且用逗号隔开（接口要求）
      const idStr = keys.join(',');
      // 发送请求改变权限
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      })
      if(res.meta.status !== 200){
        return this.$message.error('权限分配失败')
      }
      // 分配成功后（消息提示，刷新页面，关闭窗口）
      this.$message.success('权限分配成功');
      this.getRolesList();
      this.dialogVisibleRight = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.vcenter {
  display: flex;
  align-items: center;
}
.topborder {
  border-top: 1px solid #eee;
}
.bottomborder {
  border-bottom: 1px solid #eee;
}
</style>