<template>
  <div id="post-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="22">
        <h2>每日分享管理（新）</h2>
        <el-table :data="notifications">
          <el-table-column prop="date" label="日期" width="150"></el-table-column>
          <el-table-column label="通知组数量" width="100">
            <template #default="scope">
              {{ getGroupCount(scope.row.groupIds) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-link type="primary" @click="handleAggrByCity(scope.row)" size="small" class="mr8">分城市</el-link>
              <el-link type="primary" @click="handleGroupList(scope.row)" size="small">列表</el-link>
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
        <el-button type="primary" @click="copyDataToClipboard">复制</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGroupNotificationList, getGroupNotificationByCity, getGroupNotificationDetail } from '@/api/ts-group-notification'

export default {
  data() {
    return {
      notifications: [],
      dialogVisible: false,
      copyText: '',
      dataType: '' // 'city' 或 'list'
    }
  },
  mounted() {
    this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      try {
        const resp = await getGroupNotificationList()
        this.notifications = resp.data || []
      } catch (error) {
        console.error('获取通知组列表失败:', error)
        this.$message.error('获取通知组列表失败')
      }
    },
    getGroupCount(groupIds) {
      if (!groupIds) return 0
      if (Array.isArray(groupIds)) {
        return groupIds.length
      }
      return groupIds.split(',').length
    },
    async handleAggrByCity(notification) {
      try {
        const cityData = await getGroupNotificationByCity(notification.date)
        const data = cityData.data || []
        this.copyText = this.formatCityData(data)
        this.dataType = 'city'
        this.dialogVisible = true
      } catch (error) {
        console.error('获取城市聚合数据失败:', error)
        this.$message.error('获取城市聚合数据失败')
      }
    },
    async handleGroupList(notification) {
      try {
        const listData = await getGroupNotificationDetail(notification.date)
        const data = listData.data || []
        this.copyText = this.formatGroupListData(data)
        this.dataType = 'list'
        this.dialogVisible = true
      } catch (error) {
        console.error('获取通知组列表数据失败:', error)
        this.$message.error('获取通知组列表数据失败')
      }
    },
    async copyDataToClipboard() {
      try {
        await navigator.clipboard.writeText(this.copyText)
        this.$message.success('复制成功！')
      } catch (err) {
        this.$message.error('复制失败，请重试。')
        console.error('复制文本失败: ', err)
      }
      this.dialogVisible = false
    },
    formatCityData(data) {
      if (!data || data.length === 0) {
        return ''
      }
      
      let output = ''
      
      data.forEach(cityInfo => {
        output += `城市: ${cityInfo.city}\n`
        
        const groups = cityInfo.postGroups || cityInfo.groups || [];
        groups.forEach(group => {
          output += `${group.title}\t`
          output += `${group.url}\t`
          const date = group.pubDate || group.createdTime || '';
          const formattedDate = date.split(' ')[0] || date.split('T')[0] || date;
          output += `${formattedDate}\t`
          output += `${group.desc || ''}\t`
          output += '\n' // 每个通知组后添加换行
        })
        
        output += '\n' // 每个城市后添加额外换行
      })
      
      return output
    },
    formatGroupListData(data) {
      if (!data || data.length === 0) {
        return ''
      }
      
      let output = ''
      
      data.forEach(group => {
        output += `${group.city}\t`
        output += `${group.title}\t`
        output += `${group.url}\t`
        const date = group.pubDate || group.createdTime || '';
        const formattedDate = date.split(' ')[0] || date.split('T')[0] || date;
        output += `${formattedDate}\t`
        output += `${group.desc || ''}\t`
        output += '\n' // 每个通知组后添加换行
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