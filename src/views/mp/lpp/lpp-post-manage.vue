<!-- eslint-disable prefer-const -->
<!-- eslint-disable -->
<template>
  <div id="posts-container">
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

        <el-table ref="postTable" :data="posts" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="postName" label="通知名"></el-table-column>
          <el-table-column prop="city" label="城市" width="100"></el-table-column>
          <el-table-column prop="pubDate" label="发布日期" width="100"></el-table-column>
          <el-table-column prop="originSource" label="来源" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="desc" label="描述" width="180"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <div>
                <el-link type="primary" @click="handleJump(scope.row)">跳</el-link>
              </div>
              <div style="margin-top: 5px;">
                <el-link type="primary" @click="handleAction(scope.row, 0)">未</el-link>
                <el-link type="success" @click="handleAction(scope.row, 2)">初</el-link>
                <el-link type="warning" @click="handleAction(scope.row, 4)">发</el-link>
                <el-link type="info" @click="handleAction(scope.row, 5)">废</el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
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
      <h3 id="cart-container-h3">待审核列表</h3>
      <div v-if="reviewing && !noWaitReviewPosts">
        <div class="pt30">
          <h4 class="tac">审核中 <el-button type="text" @click="stopReview">退出审核</el-button></h4>
          <el-form ref="form" :model="waitReviewPosts[reviewIndex]" label-width="60px">
            <el-form-item label="通知：">
              <span>{{ waitReviewPosts[reviewIndex].postName }}</span>
            </el-form-item>
            <el-form-item label="备注：">
              <el-input v-model="waitReviewPosts[reviewIndex].desc" placeholder="请输入备注" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
          <div class="tac">
            <el-button type="success" @click="handleApprovePost(waitReviewPosts[reviewIndex])">通过</el-button>
            <el-button type="warning" @click="handleDiscardPost(waitReviewPosts[reviewIndex])">淘汰</el-button>
          </div>
        </div>
      </div>
      <div v-else>
        <el-table :data="waitReviewPosts">
          <el-table-column width="250" property="postName" label="通知" />
          <el-table-column width="100" label="操作">
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="removeFromWaitReviewList(scope.row)">移除</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="btn-container">
          <el-button type="primary" @click="startReview()">开始审核</el-button>
          <el-button type="text" class="ml16" @click="clearWaitReviewList">清空</el-button>
        </div>
      </div>

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
      <el-table :data="waitSharePosts">
        <el-table-column width="250" property="postName" label="通知" />
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
  </div>
</template>
<script>
import { searchPosts, updatePostStatus, approvePost, discardPost } from '@/api/ts-post'
import { getTsList, addPostsToList, removePostsFromList, removeList } from '@/api/ts-list'
import { createTodayNotification } from '@/api/ts-notification'

export default {
  data() {
    return {
      reviewing: false,
      reviewIndex: 0,
      waitReviewPosts: [],
      waitSharePosts: [],
      posts: [],
      searchForm: {
        city: [],
        status: [],
        keyword: '',
        pageNum: 1,
        pageSize: 100
      },
      cityOptions: [
        { value: '杭州', label: '杭州' },
        { value: '哈尔滨', label: '哈尔滨' },
        { value: '浙江', label: '浙江' }
        // Add more cities as needed
      ],
      totalCount: 0,
      selectedPosts: []
    }
  },
  computed: {
    canAddToPendingReview() {
      if (!this.selectedPosts || this.selectedPosts.length === 0) {
        return false
      }
      return this.selectedPosts.every(post => post.status === 0)
    },
    canAddToShareQueue() {
      if (!this.selectedPosts || this.selectedPosts.length === 0) {
        return false
      }
      return this.selectedPosts.every(post => post.status === 2)
    },
    noWaitReviewPosts() {
      return !this.waitReviewPosts || this.waitReviewPosts.length === 0
    }
  },
  mounted() {
    this.fetchPosts()
    this.fetchWaitingReviewList()
    this.fetchToShareList()
  },
  methods: {
    async fetchPosts() {
      const query = {
        pageNum: this.searchForm.pageNum,
        pageSize: this.searchForm.pageSize,
        city: this.searchForm.city.join(','),
        status: this.searchForm.status.join(','),
        name: this.searchForm.keyword
      }

      const resp = await searchPosts(query)
      const serverPosts = resp.data.items || []
      this.posts = serverPosts
      this.totalCount = resp.data.totalCount || 0
    },
    async fetchWaitingReviewList() {
      const resp = await getTsList(1)
      const serverPosts = resp.data.posts || []
      this.waitReviewPosts = serverPosts
    },
    async fetchToShareList() {
      const resp = await getTsList(2)
      const serverPosts = resp.data.posts || []
      this.waitSharePosts = serverPosts
    },
    async addToShareQueue() {
      const postIds = this.selectedPosts.map(post => post.postId)
      await addPostsToList(2, postIds)
      this.fetchToShareList()
    },
    async addToPendingReview() {
      const postIds = this.selectedPosts.map(post => post.postId)
      await addPostsToList(1, postIds)
      this.fetchWaitingReviewList()
    },
    async removeFromShareList(post) {
      await removePostsFromList(2, [post.postId])
      this.fetchToShareList()
    },
    async removeFromWaitReviewList(post) {
      await removePostsFromList(1, [post.postId])
      this.fetchWaitingReviewList()
    },
    async clearToShareList() {
      await removeList(2)
      this.fetchToShareList()
    },
    async clearWaitReviewList() {
      await removeList(1)
      this.fetchWaitingReviewList()
    },
    async showPending() {
      this.pageNum = 1
      this.searchForm.status = ['0']
      await this.fetchPosts()
      this.$refs.postTable.toggleAllSelection()
    },
    async showReviewed() {
      this.pageNum = 1
      this.searchForm.status = ['2']
      await this.fetchPosts()
      this.$refs.postTable.toggleAllSelection()
    },
    async handleCreateTodayNotification() {
      createTodayNotification().then(() => {
        this.$message({
          message: '创建今日推送成功',
          type: 'success',
          duration: 500
        })
        this.fetchToShareList()
        this.fetchPosts()
      })
    },
    async handleApprovePost(post) {
      await approvePost(post.postId, post.desc)

      await this.fetchWaitingReviewList()
      this.fetchPosts()
      this.startReview()
    },
    async handleDiscardPost(post) {
      await discardPost(post.postId, post.desc)

      await this.fetchWaitingReviewList()
      this.fetchPosts()

      if (this.noWaitReviewPosts) {
        this.stopReview()
      }
    },
    handleSelectionChange(selectedRows) {
      this.selectedPosts = selectedRows
    },
    handlePageChange(newPage) {
      this.pageNum = newPage
      this.fetchPosts()
    },
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchPosts()
    },
    handleReset() {
      this.searchForm.city = []
      this.searchForm.status = []
      this.searchForm.keyword = ''
      this.handleSearch()
    },
    handleJump(row) {
      if (row.url) {
        window.open(row.url, '_blank')
      }
    },
    handleAction(row, targetStatus) {
      updatePostStatus(row.postId, targetStatus).then(() => {
        this.$message({
          message: '状态已更新',
          type: 'success',
          duration: 500
        })
        this.fetchPosts()
      })
    },
    startReview() {
      if (this.noWaitReviewPosts) {
        this.stopReview()
        return
      }
      this.reviewing = true
      this.reviewIndex = 0
      window.open(this.waitReviewPosts[this.reviewIndex].url, '_blank')
    },
    stopReview() {
      this.reviewing = false
    },
    scrollToPopoverBottom(h3Id) {
      this.$nextTick(() => {
        const popoverContent = document.getElementById(h3Id).parentElement
        if (popoverContent) {
          popoverContent.scrollTop = popoverContent.scrollHeight
        }
      })
    },
    getStatusText(status) {
      switch (status) {
        case 0:
          return '未处理'
        case 2:
          return '已初审'
        case 4:
          return '已分享'
        case 5:
          return '已废弃'
        default:
          return '未知'
      }
    },
    getStatusType(status) {
      switch (status) {
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
  .pt30 {
    padding-top: 30px;
  }
  .tac {
    text-align: center;
  }
</style>
<style>
.el-table::before {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0;
}
.el-popover{
  height: 500px;
  overflow: auto;
}

</style>
