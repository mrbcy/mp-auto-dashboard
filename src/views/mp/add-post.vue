<template>
  <div class="container">
    <el-row>
      <el-col :span="16">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="公告标题">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="文章链接">
            <el-input v-model="form.url" />
          </el-form-item>
          <el-form-item label="文章内容">
            <Tinymce ref="editor" v-model="form.content" :height="300" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onAdd">添加</el-button>
            <el-button type="primary" @click="onWeeklySummary">本周汇总</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="16">
        <div class="submit-contianer">
          <el-button type="success" @click="onSubmit">发布文章</el-button>
        </div>
      </el-col>
    </el-row>
    <el-row v-for="(post,index) in posts" :key="post.url">
      <el-col :span="16">
        <div class="title-box">
          <h2 style="display:inline-block;vertical-align:center; margin-right: 16px;">{{ post.title }}</h2>
          <el-button size="small" type="danger" style="display:inline-block;vertical-align:center;" @click="delArticle(index)">删除</el-button>
        </div>
        <p>{{ post.url }}</p>
        <div>
          <div v-html="post.content" />
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { createPost } from '@/api/mp-post'
import moment from 'moment'

export default {
  components: { Tinymce },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        title: '',
        url: '',
        content: ''
      },
      posts: [
        {
          title: '文章1',
          url: 'http://www.baidu.com',
          content: `xxxxx`
        },
        {
          title: '文章2',
          url: 'http://www.qq.com',
          content: `
            <p>文章2的内容<p>
            <p>文中附件请点击&ldquo;阅读原文&rdquo;进行下载。</p><p><span style="background-color: #ff0000; color: #ffffff;"><strong>本文源自网络，如有侵权联系删除</strong></span></p><p><span style="background-color: #ff0000; color: #ffffff;"><strong>一切需要缴费报名的招聘，各位需小心甄别，避免上当受骗。</strong></span></p><p>&nbsp;</p>
          `
        }
      ]
    }
  },
  methods: {
    onSubmit() {
      if (!this.posts) {
        return
      }
      createPost(this.posts[0]).then(() => {
        this.posts = []
        this.$notify({
          title: 'Success',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    onAdd() {
      this.posts = []
      this.posts.push(this.form)
      this.form = {
        title: '',
        url: '',
        content: ''
      }
      this.$refs.editor.setContent('')
      this.$refs.editor.clearFormat()
      console.log(this.posts)
    },
    onWeeklySummary() {
      const startDay = this.getWeekStart()
      const endDay = this.getWeekEnd()

      const title = `本周岗位汇总（${startDay}到${endDay}）`
      const url = `http://performance.mrbcy.cn/static/s/${this.form.url}.html`
      const content = `<p>大家好！本篇文章将为您汇总本周（${startDay}到${endDay}）的国企、事业单位和政府部门的岗位信息。</p>
<p>想要查看完整的岗位信息，请点击下方的"<strong>阅读原文</strong>"链接，或直接访问：${url}</p>`

      this.form.title = title
      this.form.content = content
      this.form.url = url

      this.posts = []
      this.posts.push(this.form)
      this.form = {
        title: '',
        url: '',
        content: ''
      }
      this.$refs.editor.setContent('')
      this.$refs.editor.clearFormat()
      console.log(this.posts)
    },
    delArticle(index) {
      this.posts.splice(index, 1)
    },
    getWeekStart() {
      return moment().startOf('week').format('M月D日')
    },
    getWeekEnd() {
      return moment().endOf('week').format('M月D日')
    }
  }
}
</script>

<style scoped>
  .container {
    padding-top: 40px;
    padding-left: 20px;
  }

  .submit-contianer {
    padding: 20px 0;
  }

  .title-box::after {
    content:"";
    width: 0;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
  }
</style>
