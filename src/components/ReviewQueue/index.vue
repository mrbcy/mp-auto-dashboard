<template>
  <div class="review-queue">
    <h3 :id="titleId">{{ title }}</h3>
    <div v-if="reviewing && !isEmpty">
      <div class="pt30">
        <h4 class="tac">审核中 <el-button type="text" @click="stopReview">退出审核</el-button></h4>
        <el-form ref="form" :model="currentItem" label-width="60px">
          <el-form-item label="通知：">
            <span>{{ currentItem.title }}</span>
          </el-form-item>
          <el-form-item label="备注：">
            <el-input v-model="currentItem.desc" placeholder="请输入备注" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>
        <div class="tac">
          <el-button type="success" @click="handleApprove(currentItem)">通过</el-button>
          <el-button type="warning" @click="handleDiscard(currentItem)">淘汰</el-button>
        </div>
      </div>
    </div>
    <div v-else>
      <el-table :data="items">
        <el-table-column width="250" property="title" label="通知" />
        <el-table-column width="100" label="操作">
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" @click="removeItem(scope.row)">移除</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="btn-container">
        <el-button type="primary" @click="startReview()" :disabled="isEmpty">开始审核</el-button>
        <el-button type="text" class="ml16" @click="clearItems">清空</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewQueue',
  props: {
    title: {
      type: String,
      default: '待处理列表'
    },
    titleId: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      reviewing: false,
      reviewIndex: 0
    }
  },
  computed: {
    isEmpty() {
      return !this.items || this.items.length === 0
    },
    currentItem() {
      return this.items[this.reviewIndex] || {}
    }
  },
  methods: {
    startReview() {
      if (this.isEmpty) {
        this.stopReview()
        return
      }
      this.reviewing = true
      this.reviewIndex = 0
      
      // 触发跳转事件，父组件会处理实际的跳转
      this.$emit('jump', this.currentItem)
    },
    stopReview() {
      this.reviewing = false
      this.$emit('stop-review')
    },
    handleApprove(item) {
      this.$emit('approve', item)
    },
    handleDiscard(item) {
      this.$emit('discard', item)
    },
    removeItem(item) {
      this.$emit('remove', item)
    },
    clearItems() {
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.pt30 {
  padding-top: 30px;
}
.tac {
  text-align: center;
}
.btn-container {
  padding-top: 20px;
  text-align: center;
}
.ml16 {
  margin-left: 16px;
}
</style> 