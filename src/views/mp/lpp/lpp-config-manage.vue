<template>
  <div id="config-container">
    <el-row class="config-container">
      <el-col :sm="24" :md="24" :lg="22">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键字">
            <el-input v-model="searchForm.keyword" placeholder="输入关键字" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleCreate">新建配置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="configs" border style="width: 100%">
          <el-table-column prop="serviceId" label="服务ID" width="180" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="配置数据" min-width="300">
            <template slot-scope="scope">
              <pre>{{ formatConfigData(scope.row.configData) }}</pre>
            </template>
          </el-table-column>
          <el-table-column prop="createdTime" label="创建时间" width="180" />
          <el-table-column prop="modifiedTime" label="修改时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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
            @current-change="handlePageChange"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 编辑配置的对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="editDialogVisible" width="600px">
      <el-form :model="editingConfig" label-width="100px">
        <el-form-item label="服务ID">
          <el-input v-model="editingConfig.serviceId" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editingConfig.type" placeholder="选择类型" :disabled="isEditing" @change="handleTypeChange">
            <el-option label="JSON" value="JSON" />
            <el-option label="TEXT" value="TEXT" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置数据">
          <div v-if="editingConfig.type === 'JSON'" class="config-editor-toolbar">
            <el-button size="mini" type="primary" @click="formatJson">格式化JSON</el-button>
            <span class="json-status" :class="{ 'json-error': !isJsonValid }">
              {{ jsonStatusText }}
            </span>
          </div>
          <el-input
            v-model="editingConfig.configData"
            type="textarea"
            :rows="10"
            placeholder="请输入配置数据"
            :class="{ 'json-error-input': !isJsonValid && editingConfig.type === 'JSON' }"
            @input="validateJson"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="!canSubmit" @click="submitEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { searchConfigs, updateConfig, createConfig, deleteConfig } from '@/api/dynamic-config'
import jsonlint from 'jsonlint-mod'

export default {
  data() {
    return {
      configs: [],
      searchForm: {
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      totalCount: 0,
      editDialogVisible: false,
      editingConfig: {
        serviceId: '',
        configData: '',
        type: 'JSON'
      },
      isEditing: false,
      isJsonValid: true,
      jsonErrorMessage: ''
    }
  },
  computed: {
    dialogTitle() {
      return this.isEditing ? '编辑配置' : '新建配置'
    },
    jsonStatusText() {
      return this.isJsonValid ? 'JSON格式有效' : `JSON格式错误: ${this.jsonErrorMessage}`
    },
    canSubmit() {
      if (this.editingConfig.type === 'JSON') {
        return this.isJsonValid && !!this.editingConfig.serviceId
      }
      return !!this.editingConfig.serviceId
    }
  },
  mounted() {
    this.fetchConfigs()
  },
  methods: {
    async fetchConfigs() {
      try {
        const response = await searchConfigs({
          keyword: this.searchForm.keyword,
          pageNum: this.searchForm.pageNum,
          pageSize: this.searchForm.pageSize
        })

        this.configs = response.data.items || []
        this.totalCount = response.data.totalCount || 0
      } catch (error) {
        console.error('获取配置列表失败:', error)
        this.$message.error('获取配置列表失败')
      }
    },
    formatConfigData(configData) {
      try {
        if (typeof configData === 'string') {
          const parsed = JSON.parse(configData)
          return JSON.stringify(parsed, null, 2)
        }
        return JSON.stringify(configData, null, 2)
      } catch (e) {
        return configData
      }
    },
    validateJson() {
      if (this.editingConfig.type !== 'JSON') {
        this.isJsonValid = true
        return
      }

      try {
        if (!this.editingConfig.configData.trim()) {
          this.isJsonValid = false
          this.jsonErrorMessage = '配置数据不能为空'
          return
        }

        jsonlint.parse(this.editingConfig.configData)
        this.isJsonValid = true
        this.jsonErrorMessage = ''
      } catch (e) {
        this.isJsonValid = false
        this.jsonErrorMessage = e.message
      }
    },
    formatJson() {
      try {
        if (!this.editingConfig.configData.trim()) {
          return
        }

        // 先解析确保是有效的JSON
        const parsedJson = JSON.parse(this.editingConfig.configData)

        // 直接使用JSON.stringify进行格式化，确保有换行
        this.editingConfig.configData = JSON.stringify(parsedJson, null, 2)
        this.validateJson()
      } catch (e) {
        this.$message.error(`无法格式化JSON: ${e.message}`)
      }
    },
    handleTypeChange() {
      this.validateJson()
    },
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchConfigs()
    },
    handleReset() {
      this.searchForm.keyword = ''
      this.searchForm.pageNum = 1
      this.fetchConfigs()
    },
    handlePageChange(newPage) {
      this.searchForm.pageNum = newPage
      this.fetchConfigs()
    },
    handleCreate() {
      this.isEditing = false
      this.editingConfig = {
        serviceId: '',
        configData: '',
        type: 'JSON'
      }
      this.isJsonValid = true
      this.jsonErrorMessage = ''
      this.editDialogVisible = true
    },
    handleEdit(row) {
      this.isEditing = true
      this.editingConfig = {
        serviceId: row.serviceId,
        configData: row.configData,
        type: row.type
      }
      this.validateJson()
      this.editDialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteConfig(row.serviceId)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.fetchConfigs()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除配置失败:', error)
          this.$message.error('删除配置失败')
        }
      }
    },
    async submitEdit() {
      if (this.editingConfig.type === 'JSON' && !this.isJsonValid) {
        this.$message.error('JSON格式无效，请修正后再提交')
        return
      }

      try {
        if (this.isEditing) {
          await updateConfig(this.editingConfig.serviceId, {
            configData: this.editingConfig.configData,
            type: this.editingConfig.type
          })
          this.$message({
            message: '更新成功',
            type: 'success'
          })
        } else {
          await createConfig({
            serviceId: this.editingConfig.serviceId,
            configData: this.editingConfig.configData,
            type: this.editingConfig.type
          })
          this.$message({
            message: '创建成功',
            type: 'success'
          })
        }
        this.editDialogVisible = false
        this.fetchConfigs()
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('保存配置失败')
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  padding-top: 20px;
  text-align: right;
}
.search-form {
  padding-top: 30px;
  padding-bottom: 20px;
}
.config-container {
  padding: 20px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: monospace;
}
.config-editor-toolbar {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.json-status {
  margin-left: 10px;
  font-size: 12px;
  color: #67c23a;
}
.json-error {
  color: #f56c6c;
}
.json-error-input >>> .el-textarea__inner {
  border-color: #f56c6c;
}
</style>
