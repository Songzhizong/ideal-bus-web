<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="Title"
        style="width: 200px; margin-right: 2em;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select
        v-model="listQuery.subscriberType"
        clearable placeholder="订阅者类型"
        style="width: 180px; margin-right: 1em;"
        @change="handleFilter">
        <el-option
          v-for="item in this.subscriberType"
          :key="item.name"
          :label="item.label"
          :value="item.name"/>
      </el-select>
      <el-button circle
                 icon="el-icon-refresh" class="filter-item"
                 type="primary"
                 @click="resetListQuery"/>
      <el-button circle
                 icon="el-icon-search" class="filter-item"
                 type="primary"
                 @click="handleFilter"/>
      <el-button circle
                 class="filter-item"
                 type="primary"
                 icon="el-icon-plus"
                 @click="handleCreate"/>
    </div>
    <p></p>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">

      <el-table-column
        label="ID"
        prop="title"
        align="center"
        width="220px">
        <template slot-scope="{row}">
          <div @click="handleLook(row)"
               style="cursor:pointer;text-decoration:none;">
            <span>{{ row.subscriberId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        prop="title"
        align="center"
        width="200px">
        <template slot-scope="{row}">
          <div @click="handleLook(row)"
               style="cursor:pointer;text-decoration:none;">
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        prop="title"
        align="center"
        min-width="200px">
        <template slot-scope="{row}">
          <div @click="handleLook(row)"
               style="cursor:pointer;text-decoration:none;">
            <span>{{ row.desc }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        prop="title"
        align="center"
        width="180px">
        <template slot-scope="{row}">
          <div @click="handleLook(row)"
               style="cursor:pointer;text-decoration:none;">
            <span v-if="row.subscriberType===subscriberType[0].name">
              <el-tag type="primary"><b>内部订阅者</b></el-tag>
            </span>
            <span v-else>
              <el-tag type="warning"><b>外部应用</b></el-tag>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200px"
        class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <!--          <el-button-->
          <!--            icon="el-icon-notebook-2"-->
          <!--            type="primary"-->
          <!--            size="mini"-->
          <!--            @click="handleQueryLog(row)">记录-->
          <!--          </el-button>-->
          <el-dropdown>
            <el-button
              type="primary"
              size="mini"
              style="margin-left: 1em">
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-edit-outline"
                @click.native="handleUpdate(row)">编辑
              </el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                style="color: #ff0000"
                @click.native="handleDelete(row)"
                divided>删除
              </el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"/>

    <el-dialog width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="margin-left:10px; margin-right: 50px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="temp.title" :disabled="dialogStatus==='look'"/>
        </el-form-item>
        <el-form-item label="订阅者类型" prop="routeStrategy">
          <el-select
            v-model="temp.subscriberType"
            clearable placeholder="选择订阅者类型"
            :disabled="dialogStatus==='look'"
            style="width: 400px; margin-right: 1em;">
            <el-option
              v-for="item in subscriberType"
              :key="item.name"
              :label="item.label"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea"
                    :rows="4"
                    :disabled="dialogStatus==='look'"
                    v-model="temp.desc"/>
        </el-form-item>

        <el-form-item
          :hidden="temp.subscriberType!=='APPLICATION'"
          label="接收地址" prop="receiveUrl">
          <el-input type="textarea"
                    :rows="4"
                    :disabled="dialogStatus==='look'"
                    v-model="temp.receiveUrl"/>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" :hidden="dialogStatus==='look'">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()">确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog width="480px" title="确认删除" :visible.sync="deleteSubscriberDialog">
      <p style="margin-top: -15px"><b style="color: red">您确认删除此订阅者吗? </b></p>
      <p>此操作将会删除该订阅者, 并且这个结果是不可逆的.</p>
      <p>如果您确认需要删除此订阅者, 请输入订阅者ID以确认执行此项操作. </p>
      <p><code style="color: indianred;">{{ temp.subscriberId }}</code></p>
      <el-input v-model="deleteSubscriberId" v-focus></el-input>
      <p></p>
      <!--      <el-button-->
      <!--          type="primary"-->
      <!--          @click="deleteData">确定-->
      <!--      </el-button>-->
      <el-button
        size="small"
        round
        style="width: 100%"
        type="danger"
        plain
        :disabled="deleteSubscriberId!==temp.subscriberId"
        @click="deleteData">我确认删除该订阅者
      </el-button>
    </el-dialog>

    <!--    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">-->
    <!--      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">-->
    <!--        <el-table-column prop="key" label="Channel"/>-->
    <!--        <el-table-column prop="pv" label="Pv"/>-->
    <!--      </el-table>-->
    <!--      <span slot="footer" class="dialog-footer">-->
    <!--        <el-button type="primary" @click="dialogPvVisible = false">-->
    <!--          确认-->
    <!--        </el-button>-->
    <!--      </span>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import {
  query,
  create,
  update,
  del
} from "@/api/subscriber";
import moment from 'moment';

export default {
  name: "Subscriber",
  components: {Pagination},
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "danger",
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      listQuery: {
        page: 1,
        size: 10,
        title: undefined,
        application: undefined,
        subscriberType: undefined
      },
      temp: {
        subscriberId: undefined,
        title: undefined,
        desc: undefined,
        subscriberType: undefined,
        appName: undefined,
        application: undefined,
        receiveUrl: undefined,
      },
      dialogStatus: "",
      dialogFormVisible: false,
      deleteSubscriberDialog: false,
      deleteSubscriberId: "",
      listLoading: true,
      total: 0,
      subscriberType: [
        {
          name: "INTERNAL",
          label: "内部订阅者"
        }, {
          name: "APPLICATION",
          label: "外部应用订阅者"
        },
      ],
      textMap: {
        update: "修改",
        create: "新建",
        look: "查看",
      },
      rules: {
        title: [
          {required: true, message: "名称不能为空", trigger: "blur"},
        ]
      }
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      if (this.listQuery.subscriberType === '') {
        this.listQuery.subscriberType = undefined
      }
      this.listLoading = true;
      query(this.listQuery).then(response => {
        this.list = response.data
        // noinspection JSUnresolvedVariable
        this.total = response.total
      }).finally(() => {
        this.listLoading = false
      });
    },
    resetListQuery() {
      this.listQuery = {
        page: 1,
        size: 10,
        title: undefined,
        application: undefined,
        subscriberType: undefined
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        subscriberId: undefined,
        title: undefined,
        desc: undefined,
        subscriberType: undefined,
        appName: undefined,
        application: undefined,
        receiveUrl: undefined,
      }
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleDelete(row) {
      this.deleteSubscriberId = undefined
      this.temp = Object.assign({}, row); // copy obj
      this.deleteSubscriberDialog = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    deleteData() {
      del(this.deleteSubscriberId).then(() => {
        this.$notify({
          title: "成功",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.deleteSubscriberDialog = false;
        this.deleteSubscriberId = "";
        this.getList();
      });
    },
    handleLook(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "look";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          create(this.temp).then((response) => {
            this.list.unshift(response.data);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000,
            });
          })
        }
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          update(this.temp).then(() => {
            const index = this.list.findIndex((v) => v.subscriberId === this.temp.subscriberId);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000,
            });
            // this.getList();
          });
        }
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
  }
}
</script>
