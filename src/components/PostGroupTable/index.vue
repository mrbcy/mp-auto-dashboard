<template>
  <div class="post-group-table">
    <el-table
      ref="postGroupTable"
      :data="postGroups"
      @selection-change="handleSelectionChange"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
            v-loading="loadingPosts"
            :data="groupPosts[scope.row.id] || []"
            style="width: 100%"
          >
            <el-table-column prop="postName" label="通知名">
              <template slot-scope="postScope">
                <div :class="{ 'manual-post': postScope.row.postId === scope.row.manualPostId }">
                  {{ postScope.row.postName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="pubDate" label="发布日期" width="100" />
            <el-table-column prop="originSource" label="来源" width="120" />
            <el-table-column label="操作" width="180">
              <template slot-scope="postScope">
                <el-link type="primary" @click="handleJumpToPost(postScope.row)">查看原文</el-link>
                <el-link 
                  type="success" 
                  style="margin-left: 10px;"
                  @click="handleSetManualPost(scope.row, postScope.row)"
                  :disabled="postScope.row.postId === scope.row.manualPostId"
                >
                  设为主通知
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="通知组标题" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column prop="originSource" label="来源" width="150" />
      <el-table-column label="通知数量" width="100">
        <template slot-scope="scope">
          {{ scope.row.postCnt }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag size="mini" :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="描述" width="180" />
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <div>
            <el-link type="primary" @click="handleJump(scope.row)">跳</el-link>
          </div>
          <div style="margin-top: 5px;">
            <el-link type="primary" @click="handleAction(scope.row, 0)">未</el-link>
            <el-link type="success" @click="handleEditDesc(scope.row)">初</el-link>
            <el-link type="warning" @click="handleAction(scope.row, 4)">发</el-link>
            <el-link type="info" @click="handleAction(scope.row, 5)">废</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getPostGroupDetail, setManualPostId } from '@/api/ts-post-group'

export default {
  name: 'PostGroupTable',
  props: {
    postGroups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedGroups: [],
      groupPosts: {},
      loadingPosts: false
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedGroups = selection
      this.$emit('selection-change', selection)
    },
    async handleExpandChange(row, expandedRows) {
      if (expandedRows.length > 0 && !this.groupPosts[row.id]) {
        this.loadingPosts = true
        try {
          const response = await getPostGroupDetail(row.id)
          this.$set(this.groupPosts, row.id, response.data || [])
        } catch (error) {
          console.error('获取通知组详情失败:', error)
          this.$message.error('获取通知组详情失败')
        } finally {
          this.loadingPosts = false
        }
      }
    },
    handleJump(row) {
      // 如果有primaryPostId，则打开对应的URL
      if (row.manualPostId) {
        this.handleExpandChange(row, [row])
          .then(() => {
            const posts = this.groupPosts[row.id] || []
            const primaryPost = posts.find(post => post.postId === row.manualPostId)
            if (primaryPost && primaryPost.url) {
              window.open(primaryPost.url, '_blank')
            }
          })
      }
    },
    handleJumpToPost(post) {
      if (post.url) {
        window.open(post.url, '_blank')
      }
    },
    handleAction(row, targetStatus) {
      this.$emit('action', row, targetStatus)
    },
    handleEditDesc(row) {
      this.$emit('edit-desc', row)
    },
    getStatusText(status) {
      // 确保状态是数字
      const statusNum = parseInt(status)
      switch (statusNum) {
        case 0:
          return '未处理'
        case 2:
          return '已初审'
        case 4:
          return '已发布'
        case 5:
          return '已废弃'
        default:
          return '未知'
      }
    },
    getStatusType(status) {
      // 确保状态是数字
      const statusNum = parseInt(status)
      switch (statusNum) {
        case 0:
          return ''
        case 2:
          return 'success'
        case 4:
          return 'warning'
        case 5:
          return 'info'
        default:
          return 'info'
      }
    },
    toggleAllSelection() {
      this.$refs.postGroupTable.toggleAllSelection()
    },
    async handleSetManualPost(group, post) {
      try {
        // 调用 API 但不使用返回值
        await setManualPostId(group.id, post.postId)
        
        // 创建新对象来更新，避免 race condition 警告
        const updatedGroup = { ...group }
        updatedGroup.manualPostId = post.postId
        
        // 如果 post 有 originSource、title 和 url，更新 group 的相应字段
        if (post.originSource) {
          updatedGroup.originSource = post.originSource
        }
        if (post.postName) {
          updatedGroup.title = post.postName
        }
        if (post.url) {
          updatedGroup.url = post.url
        }
        
        // 使用 Object.assign 更新原对象
        Object.assign(group, updatedGroup)
        
        this.$message.success('已设置为主通知')
      } catch (error) {
        console.error('设置主通知失败:', error)
        this.$message.error('设置主通知失败')
      }
    }
  }
}
</script>

<style scoped>
.manual-post {
  font-weight: bold;
  color: #409EFF;
}
</style> 