<template>
  <div id="post-groups-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="22">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="城市">
            <el-select v-model="searchForm.city" multiple placeholder="选择城市" clearable @change="handleSearch">
              <el-option
                v-for="item in cityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" multiple placeholder="选择状态" clearable @change="handleSearch">
              <el-option label="未处理" value="0"></el-option>
              <el-option label="已初审" value="2"></el-option>
              <el-option label="已发布" value="4"></el-option>
              <el-option label="已废弃" value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关键字">
            <el-input v-model="searchForm.keyword" placeholder="输入关键字"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <div class="batch-actions">
          <el-button size="small" @click="showPending">展示未处理</el-button>
          <el-button size="small" @click="showReviewed">展示已初审</el-button>
          <el-button size="small" type="primary" @click="addToPendingReview" :disabled="!canAddToPendingReview">加入待审</el-button>
          <el-button size="small" type="primary" @click="addToShareQueue" :disabled="!canAddToShareQueue">加入待分享</el-button>
        </div>

        <post-group-table 
          ref="postGroupTable"
          :post-groups="postGroups"
          @selection-change="handleSelectionChange"
          @action="handleAction"
          @edit-desc="handleEditDesc"
        />

        <div class="pagination">
          <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="totalCount"
            :page-size="searchForm.pageSize"
            :current-page.sync="searchForm.pageNum"
            @current-change="handlePageChange">
          </el-pagination>
        </div>
      </el-col>
    </el-row>

    <el-popover
      placement="top"
      width="400"
      trigger="click"
      class="cart-container"
      @show="scrollToPopoverBottom('cart-container-h3')"
    >
      <review-queue
        title-id="cart-container-h3"
        title="待审核列表"
        :items="waitReviewGroups"
        @approve="handleApproveGroup"
        @discard="handleDiscardGroup"
        @remove="removeFromWaitReviewList"
        @clear="clearWaitReviewList"
        @jump="handleJumpToGroup"
        @stop-review="stopReview"
      />

      <el-button slot="reference" type="primary" icon="el-icon-shopping-cart-2" circle />
    </el-popover>

    <el-popover
      placement="top"
      width="400"
      trigger="click"
      class="publish-container"
      @show="scrollToPopoverBottom('publish-container-h3')"
    >
      <h3 id="publish-container-h3">待发布列表</h3>
      <el-table :data="waitShareGroups">
        <el-table-column width="250" property="title" label="通知" />
        <el-table-column width="100" label="操作">
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" @click="removeFromShareList(scope.row)">移除</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="btn-container">
        <el-button type="success" @click="handleCreateTodayNotification">发布分享</el-button>
        <el-button type="text" class="ml16" @click="clearToShareList">清空</el-button>
      </div>
      <el-button slot="reference" type="warning" icon="el-icon-star-on" circle />
    </el-popover>

    <!-- 添加编辑描述的对话框 -->
    <el-dialog title="编辑描述" :visible.sync="editDescDialogVisible" width="500px">
      <el-form :model="editingGroup" label-width="80px">
        <el-form-item label="通知名">
          <span>{{ editingGroup.title }}</span>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            :rows="4"
            v-model="editingGroup.desc"
            placeholder="请输入描述">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDescDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditDesc">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createTodayGroupNotification } from '@/api/ts-group-notification'
import { 
  searchPostGroups, 
  updatePostGroupsStatus,
  approvePostGroup, 
  discardPostGroup,
  addPostGroupsToList,
  removePostGroupsFromList,
  getWaitingReviewList,
  getToShareList,
  clearList,
  getPostGroupDetail
} from '@/api/ts-post-group'
import PostGroupTable from '@/components/PostGroupTable'
import ReviewQueue from '@/components/ReviewQueue'

export default {
  components: {
    PostGroupTable,
    ReviewQueue
  },
  data() {
    return {
      postGroups: [],
      waitReviewGroups: [],
      waitShareGroups: [],
      selectedGroups: [],
      searchForm: {
        city: [],
        status: ['0'],
        keyword: '',
        pageNum: 1,
        pageSize: 100
      },
      cityOptions: [
        { value: '哈尔滨', label: '哈尔滨' },
        { value: '杭州', label: '杭州' },
        { value: '沈阳', label: '沈阳' },
        { value: '大连', label: '大连' },
        { value: '长春', label: '长春' }
      ],
      totalCount: 0,
      editDescDialogVisible: false,
      editingGroup: {
        id: null,
        title: '',
        desc: ''
      }
    }
  },
  computed: {
    canAddToPendingReview() {
      if (!this.selectedGroups || this.selectedGroups.length === 0) {
        return false
      }
      return this.selectedGroups.every(group => group.status === 0 || group.status === '0')
    },
    canAddToShareQueue() {
      if (!this.selectedGroups || this.selectedGroups.length === 0) {
        return false
      }
      return this.selectedGroups.every(group => group.status === 2 || group.status === '2')
    }
  },
  mounted() {
    this.fetchPostGroups()
    this.fetchWaitingReviewList()
    this.fetchToShareList()
  },
  methods: {
    async fetchPostGroups() {
      try {
        const query = {
          pageNum: this.searchForm.pageNum,
          pageSize: this.searchForm.pageSize,
          name: this.searchForm.keyword
        }

        // 只有当城市选择不为空时，才添加city参数
        if (this.searchForm.city && this.searchForm.city.length > 0) {
          query.city = this.searchForm.city.join(',')
        }

        // 只有当状态选择不为空时，才添加status参数
        if (this.searchForm.status && this.searchForm.status.length > 0) {
          query.status = this.searchForm.status.join(',')
        }

        const resp = await searchPostGroups(query)
        this.postGroups = resp.data.items || []
        this.totalCount = resp.data.totalCount || 0
      } catch (error) {
        console.error('获取通知组列表失败:', error)
        this.$message.error('获取通知组列表失败')
      }
    },
    async fetchWaitingReviewList() {
      try {
        const resp = await getWaitingReviewList()
        this.waitReviewGroups = resp.data.groups || []
      } catch (error) {
        console.error('获取待审核列表失败:', error)
        this.$message.error('获取待审核列表失败')
      }
    },
    async fetchToShareList() {
      try {
        const resp = await getToShareList()
        this.waitShareGroups = resp.data.groups || []
      } catch (error) {
        console.error('获取待分享列表失败:', error)
        this.$message.error('获取待分享列表失败')
      }
    },
    async addToShareQueue() {
      try {
        const groupIds = this.selectedGroups.map(group => group.id)
        await addPostGroupsToList(2, groupIds)
        this.$message.success('已添加到待分享列表')
        this.fetchToShareList()
      } catch (error) {
        console.error('添加到待分享列表失败:', error)
        this.$message.error('添加到待分享列表失败')
      }
    },
    async addToPendingReview() {
      try {
        const groupIds = this.selectedGroups.map(group => group.id)
        await addPostGroupsToList(1, groupIds)
        this.$message.success('已添加到待审核列表')
        this.fetchWaitingReviewList()
      } catch (error) {
        console.error('添加到待审核列表失败:', error)
        this.$message.error('添加到待审核列表失败')
      }
    },
    async removeFromShareList(group) {
      try {
        await removePostGroupsFromList(2, [group.id])
        this.$message.success('已从待分享列表移除')
        this.fetchToShareList()
      } catch (error) {
        console.error('从待分享列表移除失败:', error)
        this.$message.error('从待分享列表移除失败')
      }
    },
    async removeFromWaitReviewList(group) {
      try {
        await removePostGroupsFromList(1, [group.id])
        this.$message.success('已从待审核列表移除')
        this.fetchWaitingReviewList()
      } catch (error) {
        console.error('从待审核列表移除失败:', error)
        this.$message.error('从待审核列表移除失败')
      }
    },
    async clearToShareList() {
      try {
        await clearList(2)
        this.$message.success('已清空待分享列表')
        this.fetchToShareList()
      } catch (error) {
        console.error('清空待分享列表失败:', error)
        this.$message.error('清空待分享列表失败')
      }
    },
    async clearWaitReviewList() {
      try {
        await clearList(1)
        this.$message.success('已清空待审核列表')
        this.fetchWaitingReviewList()
      } catch (error) {
        console.error('清空待审核列表失败:', error)
        this.$message.error('清空待审核列表失败')
      }
    },
    async showPending() {
      this.searchForm.pageNum = 1
      this.searchForm.status = ['0']
      await this.fetchPostGroups()
      this.$refs.postGroupTable.toggleAllSelection()
    },
    async showReviewed() {
      this.searchForm.pageNum = 1
      this.searchForm.status = ['2']
      await this.fetchPostGroups()
      this.$refs.postGroupTable.toggleAllSelection()
    },
    async handleCreateTodayNotification() {
      try {
        await createTodayGroupNotification()
        this.$message({
          message: '创建今日推送成功',
          type: 'success',
          duration: 500
        })
        this.fetchToShareList()
        this.fetchPostGroups()
      } catch (error) {
        console.error('创建今日推送失败:', error)
        this.$message.error('创建今日推送失败')
      }
    },
    async handleApproveGroup(group) {
      try {
        await approvePostGroup(group.id, group.desc)
        this.$message.success('审核通过')
        await this.fetchWaitingReviewList()
        this.fetchPostGroups()
        
        // 如果还有待审核的通知组，继续审核
        if (this.waitReviewGroups.length > 0) {
          this.handleJumpToGroup(this.waitReviewGroups[0])
        } else {
          this.stopReview()
        }
      } catch (error) {
        console.error('审核通过失败:', error)
        this.$message.error('审核通过失败')
      }
    },
    async handleDiscardGroup(group) {
      try {
        await discardPostGroup(group.id, group.desc)
        this.$message.success('已淘汰')
        await this.fetchWaitingReviewList()
        this.fetchPostGroups()
        
        // 如果还有待审核的通知组，继续审核
        if (this.waitReviewGroups.length > 0) {
          this.handleJumpToGroup(this.waitReviewGroups[0])
        } else {
          this.stopReview()
        }
      } catch (error) {
        console.error('淘汰失败:', error)
        this.$message.error('淘汰失败')
      }
    },
    handleSelectionChange(selection) {
      this.selectedGroups = selection
    },
    handlePageChange(newPage) {
      this.searchForm.pageNum = newPage
      this.fetchPostGroups()
    },
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchPostGroups()
    },
    handleReset() {
      this.searchForm.city = []
      this.searchForm.status = []
      this.searchForm.keyword = ''
      this.handleSearch()
    },
    async handleJumpToGroup(group) {
      try {
        // 如果已经有 url 属性，直接跳转
        if (group.url) {
          window.open(group.url, '_blank')
          return
        }
        
        // 如果没有 url 但有 groupId，获取组内的帖子并跳转到第一个帖子
        if (group.groupId) {
          const response = await getPostGroupDetail(group.groupId)
          const posts = response.data || []
          
          if (posts.length > 0 && posts[0].url) {
            window.open(posts[0].url, '_blank')
          } else {
            this.$message.warning('没有找到可跳转的链接')
          }
        }
      } catch (error) {
        console.error('跳转失败:', error)
        this.$message.error('跳转失败')
      }
    },
    async handleAction(group, targetStatus) {
      if (!group) return;
      
      try {
        // 使用批量更新API，但只传入单个ID
        await updatePostGroupsStatus([group.id], targetStatus);
        
        this.$message({
          message: '状态已更新',
          type: 'success',
          duration: 500
        });
        
        this.fetchPostGroups();
      } catch (error) {
        console.error('更新状态失败:', error);
        this.$message.error('更新状态失败');
      }
    },
    stopReview() {
      // 停止审核，由ReviewQueue组件触发
    },
    scrollToPopoverBottom(h3Id) {
      this.$nextTick(() => {
        const popoverContent = document.getElementById(h3Id).parentElement
        if (popoverContent) {
          popoverContent.scrollTop = popoverContent.scrollHeight
        }
      })
    },
    handleEditDesc(group) {
      this.editingGroup = {
        id: group.id,
        title: group.title,
        desc: group.desc || ''
      }
      this.editDescDialogVisible = true
    },
    async submitEditDesc() {
      try {
        await approvePostGroup(this.editingGroup.id, this.editingGroup.desc)
        this.$message({
          message: '更新成功',
          type: 'success',
          duration: 500
        })
        this.editDescDialogVisible = false
        this.fetchPostGroups()
      } catch (error) {
        console.error('更新失败:', error)
        this.$message.error('更新失败')
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  padding-top: 10px;
}
.search-form {
  padding-top: 30px;
  padding-bottom: 20px;
}
.batch-actions {
  padding-bottom: 10px;
}
.post-container {
  padding: 20px;
}
.cart-container {
  position: fixed;
  bottom: 80px;
  right: 120px;
}
.publish-container {
  position: fixed;
  bottom: 80px;
  right: 60px;
}
.btn-container {
  padding-top: 20px;
  text-align: center;
}
.ml16 {
  margin-left: 16px;
}
</style> 