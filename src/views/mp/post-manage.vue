<template>
  <div id="posts-container">
    <el-row class="post-container">
      <el-col :sm="24" :md="24" :lg="20">
        <div class="pb20 tar">
          <el-button type="primary" icon="el-icon-refresh" circle @click="manualRefreshPosts" />

        </div>
        <el-table
          :data="posts"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="title"
            label="岗位名"
          />
          <el-table-column
            label="发布状态"
            width="120"
          >
            <template slot-scope="scope">
              <el-link v-if="scope.row.status == 'READY'" type="primary" :underline="false">就绪</el-link>
              <el-link v-else-if="scope.row.status == 'DRAFT'" type="warning" :underline="false">草稿</el-link>
              <el-link v-else-if="scope.row.status == 'PUBLISHING'" type="danger" :underline="false">发布中</el-link>
              <el-link v-else-if="scope.row.status == 'PUBLISHED'" type="success" :underline="false">已发布</el-link>
              <el-link v-else type="info" :underline="false">新创建</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="预留状态"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.reserved" type="warning">已预留</el-tag>
              <el-tag v-else warning>可发布</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="pubDate"
            label="发布时间"
            width="180"
          />
          <el-table-column
            prop="content"
            label="操作"
            width="160"
          >
            <template slot-scope="scope">
              <div>
                <el-button size="mini" style="display: inline-block;" @click="moveUpPost(scope.$index, scope.row)">上移</el-button>
                <el-button size="mini" style="display: inline-block;" @click="moveDownPost(scope.$index, scope.row)">下移</el-button>
                <p />
                <el-button size="mini" @click="previewPost(scope.$index, scope.row)">预览</el-button>
                <el-button size="mini" @click="editPost(scope.$index, scope.row)">编辑</el-button>
                <el-button v-if="scope.row.reserved" style="display: block; margin: 10px 0;" size="mini" type="danger" @click="handleReleasePost(scope.$index, scope.row)">释放</el-button>
                <el-button v-if="!scope.row.reserved" style="display: block; margin: 10px 0;" size="mini" type="success" @click="handleReservePost(scope.$index, scope.row)">预留</el-button>
              </div>

            </template>
          </el-table-column>
        </el-table>
        <div id="preview-box">
          <div v-show="inPreviewMode" class="preview-tool-box tac">
            <el-button size="mini" @click="prevPost()">上一个</el-button>
            <el-button size="mini" @click="nextPost()">下一个</el-button>
            <el-button size="mini" @click="gotoSourceUrl(previewIndex, posts[previewIndex])">去原链接</el-button>
            <el-button size="mini" @click="editPost(previewIndex, posts[previewIndex])">编辑</el-button>
            <el-button v-if="previewRow.reserved" size="mini" type="danger" @click="handleReleasePost(previewIndex, posts[previewIndex])">释放</el-button>
            <el-button v-if="!previewRow.reserved" size="mini" type="success" @click="handleReservePost(previewIndex, posts[previewIndex])">预留</el-button>
            <el-button size="mini" @click="cancelPreview()">关闭预览</el-button>
          </div>
          <h2 v-show="inPreviewMode">{{ previewRow.title }}</h2>
          <div v-show="inPreviewMode" class="pt20" v-html="previewRow.content" />
          <div v-show="inPreviewMode" class="preview-tool-box tac">
            <el-button size="mini" @click="prevPost()">上一个</el-button>
            <el-button size="mini" @click="nextPost()">下一个</el-button>
            <el-button size="mini" @click="gotoSourceUrl(previewIndex, posts[previewIndex])">去原链接</el-button>
            <el-button size="mini" @click="editPost(previewIndex, posts[previewIndex])">编辑</el-button>
            <el-button v-if="previewRow.reserved" size="mini" type="danger" @click="handleReleasePost(previewIndex, posts[previewIndex])">释放</el-button>
            <el-button v-if="!previewRow.reserved" size="mini" type="success" @click="handleReservePost(previewIndex, posts[previewIndex])">预留</el-button>
            <el-button size="mini" @click="cancelPreview()">关闭预览</el-button>
          </div>
        </div>
        <div v-show="inEditMode" id="edit-box" class="edit-box">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="公告标题" prop="title">
              <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="文章链接" prop="url">
              <el-input v-model="form.url" />
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
              <Tinymce ref="editor" v-model="form.content" :height="300" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSave">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Tinymce from '@/components/Tinymce'
import { reservePost, releasePost, listTodayPosts, updatePost, reorderPosts } from '@/api/mp-post'

export default {
  components: { Tinymce },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateContent = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入文章内容'))
      }
      callback()
    }

    return {
      form: {
        id: '',
        index: 0,
        title: '',
        url: '',
        content: ''
      },
      previewIndex: 0,
      inPreviewMode: false,
      inEditMode: false,
      posts: [],
      rules: {
        title: [
          { required: true, message: '请输入岗位公告标题', trigger: 'change' }
        ],
        url: [
          { required: true, message: '请输入文章链接', trigger: 'change' }
        ],
        content: [
          { validator: validateContent, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    previewRow() {
      return this.posts[this.previewIndex] || []
    }
  },
  created() {
    this.initPosts()
  },
  methods: {
    async initPosts() {
      const resp = await listTodayPosts()
      const serverPosts = resp.data.items || []
      this.inPreviewMode = false
      this.inEditMode = false
      this.posts = serverPosts
    },
    onSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          updatePost(this.form).then(() => {
            this.$notify({
              title: '保存成功',
              message: '系统已成功保存您的修改',
              type: 'success',
              duration: 2000
            })
            this.initPosts()
          })
        } else {
          return false
        }
      })
    },
    cancelEdit() {
      this.inEditMode = false
      this.$refs.form.resetFields()
      this.scrollToTop()
    },
    cancelPreview() {
      this.inPreviewMode = false
      this.scrollToTop()
    },
    async moveUpPost(index, row) {
      let copyPosts = this.posts.slice()
      copyPosts = this.moveElementForward(copyPosts, index)
      const postIds = copyPosts.map(item => item.id)
      await reorderPosts(postIds)
      this.initPosts()
    },
    async moveDownPost(index, row) {
      let copyPosts = this.posts.slice()
      copyPosts = this.moveElementBackward(copyPosts, index)
      const postIds = copyPosts.map(item => item.id)
      await reorderPosts(postIds)
      this.initPosts()
    },
    moveElementForward(arr, index) {
      if (index >= 0 && index < arr.length) {
        const element = arr.splice(index, 1)
        const newPosition = index - 1 >= 0 ? index - 1 : 0
        arr.splice(newPosition, 0, element[0])
      }
      return arr
    },
    moveElementBackward(arr, index) {
      if (index >= 0 && index < arr.length - 1) {
        const element = arr.splice(index, 1)
        const newPosition = index + 1
        arr.splice(newPosition, 0, element[0])
      }
      return arr
    },
    previewPost(index, row) {
      this.previewIndex = index
      this.inPreviewMode = true
      this.scrollToPreview()
    },
    scrollToPreview() {
      this.$nextTick(() => {
        const element = document.getElementById('preview-box')
        element.scrollIntoView({ behavior: 'smooth' })
      })
    },
    scrollToEdit() {
      this.$nextTick(() => {
        const element = document.getElementById('edit-box')
        element.scrollIntoView({ behavior: 'smooth' })
      })
    },
    scrollToTop() {
      this.$nextTick(() => {
        const element = document.getElementById('posts-container')
        element.scrollIntoView({ behavior: 'smooth' })
      })
    },
    prevPost() {
      if (!this.posts || this.posts.length === 0) {
        this.inPreviewMode = false
        return
      }

      const nextIndex = this.previewIndex - 1
      if (nextIndex < 0) {
        return
      }

      this.previewIndex = nextIndex
    },
    nextPost() {
      if (!this.posts || this.posts.length === 0) {
        this.inPreviewMode = false
        return
      }

      const nextIndex = this.previewIndex + 1
      if (nextIndex >= this.posts.length) {
        return
      }

      this.previewIndex = nextIndex
    },
    editPost(index, row) {
      this.inPreviewMode = false
      this.form.title = row.title
      this.form.id = row.id
      this.form.index = index
      this.form.url = row.sourceUrl
      this.form.content = row.content
      this.$refs.editor.setContent(row.content)
      this.inEditMode = true
      this.scrollToEdit()
    },
    gotoSourceUrl(index, row) {
      window.open(row.sourceUrl, '_blank')
    },
    handleReleasePost(index, row) {
      releasePost(row.id).then(() => {
        this.posts[index].reserved = false
        this.$notify({
          title: '操作成功',
          message: '文章已被释放',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleReservePost(index, row) {
      reservePost(row.id).then(() => {
        this.posts[index].reserved = true
        this.$notify({
          title: '操作成功',
          message: '文章已被保留',
          type: 'success',
          duration: 2000
        })
      })
    },
    manualRefreshPosts() {
      this.initPosts().then(() => {
        this.$notify({
          title: '操作成功',
          message: '岗位列表已刷新',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
<style scoped>
  .post-container {
    padding: 20px;
  }
  .tac {
    text-align: center;
  }
  .preview-tool-box, .edit-box {
    padding: 20px 0;
  }
  .pt20 {
    padding-top: 20px;
  }

  .pb20 {
    padding-bottom: 20px;
  }
  .tar {
    text-align: right;
  }
</style>
