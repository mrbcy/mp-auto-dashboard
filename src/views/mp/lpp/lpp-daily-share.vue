<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <div id="post-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="22">
        <h2>每日分享管理</h2>
        <el-table :data="notifications">
          <el-table-column prop="date" label="日期" width="150"></el-table-column>
          <el-table-column label="Post 数量" width="100">
            <template #default="scope">
              {{ getPostCount(scope.row.postIds) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-link type="primary" @click="handleEdit(scope.row)" size="small" class="mr8">回填</el-link>
              <el-link type="primary" @click="handleAggrByCity(scope.row)" size="small" class="mr8">分城市</el-link>
              <el-link type="primary" @click="handleAggrByLine(scope.row)" size="small">列表</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog
      title="复制到剪切板"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <span>数据已经生成，是否复制到剪切板？</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="copyCityStrToClipboard(cityStr)">复制</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getNotificationList, getNotificationByCity, getNotificationByLine } from '@/api/ts-notification'

export default {
  data() {
    return {
      notifications: [],
      form: {
        title: '',
        url: '',
        content: ''
      },
      cityStr: '',
      copyText: '需要复制的文本测试',
      dialogVisible: false
    }
  },
  mounted() {
    this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      const resp = await getNotificationList()
      const ns = resp.data || []
      this.notifications = ns
    },
    getPostCount(postIds) {
      return postIds.split(',').length
    },
    async handleAggrByLine(nt) {
      const cityData = await getNotificationByLine(nt.date)
      const data = cityData.data || []
      this.cityStr = this.formatCityLineData(data)
      this.dialogVisible = true
    },
    async handleAggrByCity(nt) {
      const cityData = await getNotificationByCity(nt.date)
      const data = cityData.data || []
      this.cityStr = this.formatCityData(data)
      this.dialogVisible = true
    },
    async copyCityStrToClipboard(text) {
      console.log(text)
      try {
        await navigator.clipboard.writeText(text)
        this.$message.success('复制成功！')
      } catch (err) {
        this.$message.error('复制失败，请重试。')
        console.error('Failed to copy text: ', err)
      }
      this.dialogVisible = false
    },
    formatCityLineData(data) {
      if (!data || data.length === 0) {
        return ''
      }
      let output = ''
      data.forEach(post => {
        output += `${post.city}\t`
        output += `${post.postName}\t`
        output += `${post.url}\t`
        output += `${post.pubDate}\t`
        output += `${post.desc}\t`
        output += '\n' // Add a newline after each post
      })

      output += '\n' // Add an extra newline between cities
      return output
    },
    formatCityData(data) {
      let output = ''

      data.forEach(cityInfo => {
        output += `城市: ${cityInfo.city}\n`

        cityInfo.posts.forEach(post => {
          output += `${post.postName}\t`
          output += `${post.url}\t`
          output += `${post.pubDate}\t`
          output += `${post.desc}\t`
          output += '\n' // Add a newline after each post
        })

        output += '\n' // Add an extra newline between cities
      })

      return output
    }
  }
}
</script>
<style scoped>
  .post-container {
    padding: 20px;
  }
  .mr8 {
    margin-right: 8px;
  }
</style>

<style>
.el-table::before {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0;
}

</style>
