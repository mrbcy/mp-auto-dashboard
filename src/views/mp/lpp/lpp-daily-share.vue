<template>
  <div id="posts-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="20">
        <div>每日分享管理</div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        title: '',
        url: '',
        content: ''
      }
    }
  }
}
</script>
<style scoped>
  .post-container {
    padding: 20px;
  }
</style>
