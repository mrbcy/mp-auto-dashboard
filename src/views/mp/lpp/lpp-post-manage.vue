<template>
  <div id="posts-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="20">
        <div>LPP通知管理</div>
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
      <div v-if="reviewing">
        <div class="pt30">
          <h4 class="tac">审核中 <el-button type="text" @click="stopReview">退出审核</el-button></h4>
          <el-form ref="form" :model="waitReviewPosts[reviewIndex]" label-width="60px">
            <el-form-item label="通知：">
              <span>{{ waitReviewPosts[reviewIndex].title }}</span>
            </el-form-item>
            <el-form-item label="备注：">
              <el-input v-model="waitReviewPosts[reviewIndex].desc" placeholder="请输入备注" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
          <div class="tac">
            <el-button type="success">通过</el-button>
            <el-button type="warning">淘汰</el-button>
          </div>
        </div>
      </div>
      <div v-else>
        <el-table :data="waitReviewPosts">
          <el-table-column width="250" property="title" label="通知" />
          <el-table-column width="100" property="name" label="操作">
            <template>
              <el-link type="primary" :underline="false">移除</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="btn-container">
          <el-button type="primary" @click="startReview()">开始审核</el-button>
          <el-button type="text" class="ml16">清空</el-button>
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
      <el-table :data="waitReviewPosts">
        <el-table-column width="250" property="title" label="通知" />
        <el-table-column width="100" property="name" label="操作">
          <template>
            <el-link type="primary" :underline="false">移除</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="btn-container">
        <el-button type="success">发布分享</el-button>
        <el-button type="text" class="ml16">清空</el-button>
      </div>
      <el-button slot="reference" type="warning" icon="el-icon-star-on" circle />
    </el-popover>
  </div>
</template>
<script>
export default {
  data() {
    return {
      reviewing: false,
      reviewIndex: 0,
      waitReviewPosts: [
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        },
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        },
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        },
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        },
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        },
        {
          title: '杭州住房公积金管理中心招聘编外人员公告',
          desc: '',
          url: 'https://www.baidu.com'
        },
        {
          title: '杭州市人大常委会办公厅2024招聘通知',
          desc: '',
          url: 'https://www.qq.com'
        }
      ]
    }
  },
  methods: {
    startReview() {
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
    }
  }
}
</script>
<style scoped>
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
.el-popover{
  height: 500px;
  overflow: auto;
}

</style>
