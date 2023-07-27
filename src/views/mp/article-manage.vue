<template>
  <div>
    <el-row class="article-container">
      <el-col :sm="24" :md="24" :lg="20">
        <div class="pb20 tar">
          <el-button type="primary" icon="el-icon-s-promotion" round @click="submitArticle">创建今日推送</el-button>
          <el-button type="danger" icon="el-icon-refresh-right" round @click="deleteArticle">删置今日推送</el-button>
        </div>
        <el-table
          :data="articles"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="date"
            label="日期"
            width="200"
          />
          <el-table-column
            prop="materialId"
            label="资料id"
          />
          <el-table-column
            label="文章数"
            width="80"
          >
            <template slot-scope="scope">
              {{ scope.row.postIds.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.publishStatus == 'CREATED'" type="info">新创建</el-tag>
              <el-tag v-else-if="scope.row.publishStatus == 'DRAFT'">草稿</el-tag>
              <el-tag v-else-if="scope.row.publishStatus == 'RESET'" type="danger">已重置</el-tag>
              <el-tag v-else-if="scope.row.publishStatus == 'PUBLISHING'" type="warning">发布中</el-tag>
              <el-tag v-else-if="scope.row.publishStatus == 'PUBLISHED'" type="success">已发布</el-tag>
              <el-tag v-else effect="dark" type="info">新创建</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="content"
            label="标记状态"
            width="160"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.date == todayStr">
                <el-link type="danger" :underline="false" style="display: inline-block; margin-right: 16px;" @click="setStatus('RESET')">重置</el-link>
                <el-link type="primary" :underline="false" @click="setStatus('DRAFT')">草稿</el-link>
                <el-link type="success" :underline="false" style="display: block; margin-top: 10px;" @click="setStatus('PUBLISHED')">已发</el-link>
              </div>
              <div v-else> - </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { listArticles, submitTodayArticle, updateArticleStatus, deleteTodayArticle } from '@/api/mp-article'

export default {
  data() {
    return {
      articles: []
    }
  },
  computed: {
    todayStr() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }
  },
  created() {
    this.initArticles()
  },
  methods: {
    async initArticles() {
      const resp = await listArticles()
      const serverArticles = resp.data.items || []
      this.articles = serverArticles
    },
    setStatus(status) {
      updateArticleStatus(this.todayStr, status).then(() => {
        this.$notify({
          title: '操作成功',
          message: '成功设置文章状态',
          type: 'success',
          duration: 2000
        })
        this.initArticles()
      })
    },
    submitArticle() {
      submitTodayArticle().then(() => {
        this.$notify({
          title: '操作成功',
          message: '今日文章已提交草稿',
          type: 'success',
          duration: 2000
        })
        this.initArticles()
      })
    },
    deleteArticle() {
      deleteTodayArticle().then(() => {
        this.$notify({
          title: '操作成功',
          message: '今日推送草稿已删除并重置',
          type: 'success',
          duration: 2000
        })
        this.initArticles()
      })
    }
  }
}
</script>
<style scoped>
  .article-container {
    padding: 20px;
  }
  .pb20 {
    padding-bottom: 20px;
  }
  .tar {
    text-align: right;
  }
</style>
