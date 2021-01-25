<template>
  <div class="more-detail">
    <a-card :bordered="false">
      <span class="return-top" @click="returnTop">返回</span>
      <a-descriptions title="进出港报备">
        <a-descriptions-item label="ID&船名">{{ shipName }}</a-descriptions-item>
        <a-descriptions-item label="主管部门">{{ department }}</a-descriptions-item>
        <a-descriptions-item label="报备人">{{ ownerName }}</a-descriptions-item>
        <a-descriptions-item label="报备时间">{{ reportTime }}</a-descriptions-item>
        <a-descriptions-item label="拟出港时间">{{ departureTime }}</a-descriptions-item>
        <a-descriptions-item label="作业范围">{{ range }}</a-descriptions-item>
        <a-descriptions-item label="事由">{{ reason }}</a-descriptions-item>
      </a-descriptions>
      <a-divider style="margin-bottom: 32px" />
      <div class="title">随船人员</div>
      <a-table style="margin-bottom: 24px" :pagination="false" row-key="id" :columns="goodsColumns" :data-source="loadData">
        <a slot="action" href="javascript:;">查看</a>
        <img style="width:50px;heigth:50px" slot="departure_image" slot-scope="text, record" :src="record.departure_image" />
        <a slot="action" href="javascript:;">查看</a>
        <img style="width:50px;heigth:50px" slot="return_image" slot-scope="text, record" :src="record.return_image" />
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { STable } from '@/components'
import { getVoyaeDetail } from '@/api/ship-api'
export default {
  name: 'TaskForm',
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  components: {
    STable
  },
  data () {
    return {
      goodsColumns: [
        {
          title: '姓名',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '手机号',
          dataIndex: 'phone',
          key: 'phone'
        },
        {
          title: '身份证号码',
          dataIndex: 'id_card',
          key: 'id_card'
        },
        {
          title: '登船体温',
          dataIndex: 'departure_temp',
          key: 'departure_temp',
          align: 'center'
        },
        {
          title: '下船体温',
          dataIndex: 'return_temp',
          key: 'return_temp',
          align: 'center'
        },
        {
          title: '上船时间',
          dataIndex: 'departure_time',
          key: 'departure_time',
          align: 'center'
        },
        {
          title: '下船时间',
          dataIndex: 'return_time',
          key: 'return_time',
          align: 'center'
        },
        {
          title: '登船信息',
          dataIndex: 'departure_image',
          key: 'departure_image',
          align: 'center',
          scopedSlots: {
            customRender: 'departure_image'
          }
        },
        {
          title: '下船信息',
          dataIndex: 'return_image',
          key: 'return_image',
          align: 'center',
          scopedSlots: {
            customRender: 'return_image'
          }
        }
      ],
      loadData: [],
      shipName: '', // 船名
      department: '', // 主管部门
      ownerName: '', // 报备人
      reportTime: '', // 报备时间
      departureTime: '', //  出港时间
      range: '', // 作业范围
      reason: '' // 事由
    }
  },
  methods: {
    returnTop () {
      this.$emit('closePop')
    }
  },
  created () {
    getVoyaeDetail('/ship/voyage-record/show/' + this.id).then(res => {
      this.shipName = res.equipment.boat_name
      this.department = res.equipment.department
      this.ownerName = res.equipment.owner_name
      this.reportTime = res.equipment.report_time
      this.departureTime = res.equipment.departure_time
      this.range = res.equipment.range
      this.reason = res.equipment.reason
      this.loadData = res.people
    })
  }
}
</script>
<style lang="less" scoped>
.more-detail {
  min-width: 100%;
  min-height: 100%;
  background-color: #fff;
  z-index: 999;
  position: absolute;
}
.return-top {
  position: absolute;
  right: 5%;
  cursor: pointer;
}
.title {
  color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}
</style>
