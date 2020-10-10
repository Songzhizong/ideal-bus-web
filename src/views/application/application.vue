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
        v-model="listQuery.applicationType"
        clearable placeholder="应用类型"
        style="width: 180px; margin-right: 1em;"
        @change="handleFilter">
        <el-option
          v-for="item in this.applicationType"
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
      <el-button style="float: right;"
                 class="filter-item"
                 type="primary"
                 @click="refreshCacheNotice">刷新Broker缓存
      </el-button>
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
          <span>{{ row.applicationId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        prop="title"
        align="center"
        width="200px">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        prop="title"
        align="center"
        min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.desc }}</span>
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
            <span v-if="row.applicationType===applicationType[0].name">
              <el-tag type="primary"><b>内部应用</b></el-tag>
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
                @click.native="handleUpdate(row)">编辑信息
              </el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-circle-plus-outline"
                @click.native="handleAddSubscribe(row)">添加订阅
              </el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-tickets"
                @click.native="handleSubscription(row)">订阅列表
              </el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                style="color: #ff0000"
                @click.native="handleDelete(row)"
                divided>删除应用
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
        <el-form-item label="应用类型" prop="routeStrategy">
          <el-select
            v-model="temp.applicationType"
            clearable placeholder="选择应用类型"
            :disabled="dialogStatus==='look'"
            style="width: 400px; margin-right: 1em;">
            <el-option
              v-for="item in applicationType"
              :key="item.name"
              :label="item.label"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea"
                    :autosize="{ minRows: 2, maxRows: 5}"
                    :disabled="dialogStatus==='look'"
                    v-model="temp.desc"/>
        </el-form-item>

        <el-form-item
          :hidden="temp.applicationType!=='EXTERNAL'"
          label="接收地址" prop="receiveUrl">
          <el-input type="textarea"
                    :autosize="{ minRows: 2, maxRows: 5}"
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

    <el-dialog width="480px" :visible.sync="deleteApplicationDialog">
      <p style="margin-top: -15px"><b style="color: red">您确认删除此应用吗? </b></p>
      <p>此操作将会删除该应用, 并且这个结果是不可逆的.</p>
      <p>如果您确认需要删除此应用, 请输入应用ID以确认执行此项操作. </p>
      <p><code style="color: indianred;">{{ temp.applicationId }}</code></p>
      <el-input v-model="deleteApplicationId" v-focus></el-input>
      <p></p>
      <el-button
        size="small"
        round
        style="width: 100%"
        type="danger"
        plain
        :disabled="deleteApplicationId!==temp.applicationId"
        @click="deleteData">我确认删除该应用
      </el-button>
    </el-dialog>


    <el-dialog width="480px" :visible.sync="unsubscribeDialog">
      <p style="margin-top: -15px"><b style="color: red">您确认解除此订阅关系吗? </b></p>
      <p>此操作将会解除该订阅关系, 并且这个结果是不可逆的.</p>
      <p>如果您只是希望暂时解除订阅关系, 可以点击旁边的状态按钮将订阅状态修改为停用.</p>
      <p>如果您确认需要解除, 请输入Topic:
        <code style="color: indianred;">{{ subscribeTemp.topic }}</code>
        以确认执行此项操作. </p>
      <el-input v-model="unsubscribeTopic" v-focus></el-input>
      <p></p>
      <el-button
        size="small"
        round
        style="width: 100%"
        type="danger"
        plain
        :disabled="unsubscribeTopic!==subscribeTemp.topic"
        @click="doUnSubscribe">我确认解除该订阅关系
      </el-button>
    </el-dialog>

    <el-dialog width="600px" :title="textMap[dialogStatus]" :visible.sync="subscribeDialog">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="margin-left:10px; margin-right: 50px">
        <el-form-item label="Topic" prop="topic">
          <el-input v-model="subscribeTemp.topic"
                    placeholder="请输入订阅的主题"
                    :disabled="dialogStatus!=='create'"/>
        </el-form-item>
        <el-form-item label="名称" prop="listenerName">
          <el-input v-model="subscribeTemp.listenerName"
                    placeholder="请输入监听器名称"
                    :disabled="dialogStatus!=='create'"/>
        </el-form-item>
        <el-form-item label="延迟表达式" prop="delayExp">
          <el-input v-model="subscribeTemp.delayExp"
                    placeholder=""/>
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="最大重试" prop="retryCount">
              <el-input-number v-model="subscribeTemp.retryCount"
                               :min="0" :max="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="10" style="margin-left: 40px">
            <el-form-item label="是否广播" prop="broadcast">
              <el-switch v-model="subscribeTemp.broadcast"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="订阅条件" prop="desc">
          <el-input type="textarea"
                    :autosize="{ minRows: 2}"
                    placeholder="订阅表达式, 如:
tenantId=10&deviceGroup^1,2,3,4|tenantId=10&age>20 "
                    v-model="subscribeTemp.condition"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="subscribeDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?addSubscribe():updateSubscribe()">确定
        </el-button>
      </div>
    </el-dialog>

    <el-drawer
      :visible.sync="subscriptionDrawer"
      direction="ltr"
      size="70%">
      <div style="margin-left: 10px;margin-right: 20px;margin-top: -30px">
        <el-table
          :height="subscriptionTableHeight"
          :key="subTableKey"
          :data="subscriptionList">
          <el-table-column align="center"
                           property="topic"
                           label="主题" width="200px"/>
          <el-table-column align="center"
                           property="condition"
                           label="订阅条件" min-width="200px"/>
          <!--          <el-table-column align="center"-->
          <!--                           property="consumeType"-->
          <!--                           label="订阅类型" width="120px">-->
          <!--            <template slot-scope="{row}">-->
          <!--              <span v-if="row.consumeType===0">并行</span>-->
          <!--              <span v-if="row.consumeType===1">队列</span>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column align="center"
                           property="retryCount"
                           label="最大重试" width="100px"/>
          <el-table-column align="center"
                           property="status"
                           label="广播" width="100px">
            <template slot-scope="{row}">
              <span v-if="row.broadcast===true"><el-tag>是</el-tag></span>
              <span v-if="row.broadcast===false"><el-tag type="info">否</el-tag></span>
            </template>
          </el-table-column>
          <el-table-column align="center"
                           property="status"
                           label="当前状态" width="100px">
            <template slot-scope="{row}">
              <span v-if="row.status===0"><el-tag type="info">停用</el-tag></span>
              <span v-if="row.status===1"><el-tag>启用</el-tag></span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="120px"
            class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
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
                    @click.native="handleUpdateSubscribe(row)">修改信息
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="el-icon-refresh-left"
                    @click.native="reversalSubscriptionStatus(row)">反转状态
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="el-icon-delete"
                    style="color: #ff0000"
                    @click.native="handleUnsubscribe(row)"
                    divided>解除订阅
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import {
  query,
  create,
  update,
  del
} from "@/api/application";
import {
  getAllByApplication,
  subscribe,
  update as updateSubscription,
  reversalStatus,
  unsubscribe,
} from "@/api/subscription";
import {
  refreshCacheNotice
} from "@/api/cache"

export default {
  name: "Application",
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
      subTableKey: 1,
      list: null,
      subscriptionList: null,
      listQuery: {
        page: 1,
        size: 10,
        title: undefined,
        application: undefined,
        applicationType: undefined
      },
      temp: {
        applicationId: undefined,
        title: undefined,
        desc: undefined,
        applicationType: undefined,
        appName: undefined,
        application: undefined,
        receiveUrl: undefined,
      },
      subscribeTemp: {
        subscriptionId: undefined,
        applicationId: undefined,
        topic: undefined,
        listenerName: undefined,
        delayExp: undefined,
        condition: undefined,
        broadcast: false,
        retryCount: 0
      },
      dialogStatus: "",
      dialogFormVisible: false,
      deleteApplicationDialog: false,
      unsubscribeDialog: false,
      subscribeDialog: false,
      subscriptionDrawer: false,
      unsubscribeTopic: undefined,
      unsubscribeApplicationId: undefined,
      deleteApplicationId: "",
      listLoading: true,
      subscriptionTableHeight: 700,
      total: 0,
      applicationType: [
        {
          name: "INTERNAL",
          label: "内部应用"
        }, {
          name: "EXTERNAL",
          label: "外部应用"
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
        ],
        topic: [
          {required: true, message: "topic不能为空", trigger: "blur"},
        ],
        listenerName: [
          {required: true, message: "监听器名称不能为空", trigger: "blur"},
        ],
      }
    }
  },
  created() {
    this.subscriptionTableHeight = document.body.clientHeight - 80;
    this.getList();
  },
  methods: {
    getList() {
      if (this.listQuery.applicationType === '') {
        this.listQuery.applicationType = undefined
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
        applicationType: undefined
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        applicationId: undefined,
        title: undefined,
        desc: undefined,
        applicationType: undefined,
        appName: undefined,
        application: undefined,
        receiveUrl: undefined,
      }
    },
    resetSubscribeTemp() {
      this.subscribeTemp = {
        subscriptionId: undefined,
        applicationId: undefined,
        topic: undefined,
        condition: undefined,
        broadcast: false,
        retryCount: 0
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
      this.deleteApplicationId = undefined
      this.temp = Object.assign({}, row); // copy obj
      this.deleteApplicationDialog = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    deleteData() {
      del(this.deleteApplicationId).then(() => {
        this.$notify({
          title: "成功",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.deleteApplicationDialog = false;
        this.deleteApplicationId = "";
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
            const index = this.list.findIndex((v) => v.applicationId === this.temp.applicationId);
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
    getSubscriptionList(applicationId) {
      getAllByApplication(applicationId).then(response => {
        this.subscriptionList = response.data;
      });
    },
    handleSubscription(row) {
      this.getSubscriptionList(row.applicationId);
      this.subscriptionDrawer = true;
    },
    handleAddSubscribe(row) {
      this.resetSubscribeTemp();
      this.dialogStatus = "create";
      this.subscribeDialog = true;
      this.subscribeTemp.applicationId = row.applicationId
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleUpdateSubscribe(row) {
      this.subscribeTemp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.subscribeDialog = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleUnsubscribe(row) {
      this.unsubscribeTopic = undefined;
      this.unsubscribeApplicationId = row.applicationId;
      this.subscribeTemp = Object.assign({}, row); // copy obj
      this.unsubscribeDialog = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    addSubscribe() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          subscribe(this.subscribeTemp).then(() => {
            this.subscribeDialog = false;
            this.$notify({
              title: "成功",
              message: "订阅成功",
              type: "success",
              duration: 2000,
            });
          })
        }
      });
    },
    updateSubscribe() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          updateSubscription(this.subscribeTemp).then(() => {
            this.subscribeDialog = false;
            this.$notify({
              title: "成功",
              message: "修改成功",
              type: "success",
              duration: 2000,
            });
            this.getSubscriptionList(this.subscribeTemp.applicationId);
          })
        }
      });
    },
    reversalSubscriptionStatus(row) {
      reversalStatus(row.subscriptionId).then(() => {
        this.subscribeDialog = false;
        this.$notify({
          title: "成功",
          message: "修改成功",
          type: "success",
          duration: 2000,
        });
        this.getSubscriptionList(row.applicationId);
      });
    },
    doUnSubscribe() {
      unsubscribe(this.subscribeTemp.applicationId, this.subscribeTemp.topic)
        .then(() => {
          this.unsubscribeDialog = false;
          this.$notify({
            title: "成功",
            message: "修改成功",
            type: "success",
            duration: 2000,
          });
          this.getSubscriptionList(this.subscribeTemp.applicationId);
        });
    },
    refreshCacheNotice() {
      refreshCacheNotice().then(() => {
        this.$notify({
          title: "成功",
          message: "已通知各节点刷新缓存",
          type: "success",
          duration: 2000,
        });
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
  }
}
</script>
