<template>
  <div class="more-detail">
    <a-card :bordered="false">
      <div class="model-pop">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="围栏名称">
            <a-input v-decorator="['fenceName', { rules: [{ required: true, message: '请填写围栏名称' }] }]" />
          </a-form-item>
          <a-form-item label="预警等级">
            <a-select
              v-decorator="['fenceLevel', { rules: [{ required: true, message: '请选择预警等级' }] }]"
              placeholder="请选择"
              @change="handleSelectChange"
            >
              <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in levelList" :key="levelIndex">{{
                levelItem.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="预警媒体">
            <a-checkbox-group v-model="checkValue">
              <a-checkbox value="0" disabled defaultChecked>
                系统
              </a-checkbox>
              <a-checkbox value="1" defaultChecked>
                短信
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <!-- <a-form-item label="预警内容">
            <a-textarea
              rows="3"
              v-decorator="['gender', { rules: [{ required: true, message: 'Please select your gender!' }] }]"
            />
          </a-form-item> -->
          <a-form-item label="接收人">
            <a-checkbox-group :options="recipientList" @change="recipientChange" :default-value="defalutCheckList">
              <!-- <a-checkbox
                :value="checkItem.value"
                name="type"
                v-for="(checkItem, checkIndex) in recipientList"
                :key="checkIndex"
                :checked="checkItem.isCheck"
              >
                {{ checkItem.label }}
              </a-checkbox> -->
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="围栏绘制">
            <div @click="showBigMap">点击修改地图</div>
          </a-form-item>
          <a-form-item label="状态">
            <a-switch v-model="switchValue" @change="statusChange" />
          </a-form-item>
          <a-form-item label="触发类型">
            <a-radio-group v-model="triggerType" @change="triggerChange">
              <a-radio :value="0">
                进入警告
              </a-radio>
              <a-radio :value="1">
                出去警告
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="开始时间">
            <a-date-picker @change="startTimeChange" placeholder="请选择" v-model="startTime" />
          </a-form-item>
          <a-form-item label="结束时间">
            <a-date-picker @change="endTimeChange" placeholder="请选择" v-model="endTime" />
          </a-form-item>
          <!-- <a-form-item label="结束时间">
            <a-switch v-model="switchValue" />
          </a-form-item> -->
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit" @click="commitResult">
              提交
            </a-button>
            <a-button style="margin-left:20px" @click="closeParentPop">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-modal
        :centered="true"
        title="围栏绘制"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
        @cancel="handleCancel"
        :width="widths"
        class="big-modal"
      >
        <div id="bigMap"></div>
        <div class="menu-box">
          <div class="draw-tools-item" @click="round">
            圆形
          </div>
          <div class="draw-tools-item" @click="Rectangle">
            矩形
          </div>
          <div class="draw-tools-item" @click="polygon">
            多边形
          </div>
        </div>
      </a-modal>
    </a-card>
  </div>
</template>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script>
import 'leaflet-polylinedecorator/dist/leaflet.polylineDecorator'
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders'
import 'leaflet.motion/dist/leaflet.motion.min'
import 'leaflet-draw/dist/leaflet.draw'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import { getFenceDetail, editFenceInfo, addFenceInfo } from '@/api/electronic-api'
import moment from 'moment'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
export default {
  props: {
    id: {
      type: Number,
      default: 0
    },
    openType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      locale,
      dataResult: [], // 页面数据
      patternType: '', // 图案类型
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      checkValue: ['0'], // 预警媒体选择
      visible: false, // 控制大地图的显示
      confirmLoading: false,
      radioValue: '',
      switchValue: false,
      widths: 700,
      recipientCheckValus: [], // 接收人选中结果
      checkList: [
        {
          label: '系统',
          value: '0',
          isCheck: true
        },
        {
          label: '短信',
          value: '1',
          isCheck: false
        }
      ],
      recipientList: [
        {
          label: '市局',
          value: '001',
          isCheck: 0,
          defaultCheck: true
        },
        {
          label: '分局',
          value: '002',
          isCheck: 0,
          defaultCheck: false
        },
        {
          label: '派出所',
          value: '003',
          isCheck: 0,
          defaultCheck: false
        }
      ], // 接收人列表
      defalutCheckList: [], // 接收人已选内容
      smsChecState: false, // 是否勾选短信
      levelList: [
        {
          value: 'Ⅰ级',
          name: 'Ⅰ级',
          id: 1
        },
        {
          value: 'Ⅱ级',
          name: 'Ⅱ级',
          id: 2
        },
        {
          value: 'Ⅲ级',
          name: 'Ⅲ级',
          id: 3
        },
        {
          value: 'Ⅳ级',
          name: 'Ⅳ级',
          id: 4
        },
        {
          value: 'Ⅴ级',
          name: 'Ⅴ级',
          id: 5
        }
      ], // 预警等级集合
      map: null,
      bigMap: null,
      roundList: [],
      baseImg: null, // 初始图案
      commitImg: null, //  需要提交的图案
      triggerType: -1, // 触发类型
      startTime: null,
      endTime: null,
      dateFormat: 'YYYY-MM-DD'
    }
  },
  methods: {
    moment,
    // 获取基础信息
    getBaseContent() {
      return getFenceDetail('/electronic/edit/' + this.id).then(res => {
        this.dataResult = res.data.data
        this.triggerType = res.data.data.type
        this.recipientList[0].isCheck = res.data.data.city
        this.recipientList[1].isCheck = res.data.data.area
        this.recipientList[2].isCheck = res.data.data.station
        this.startTime = res.data.data.start_time
        this.endTime = res.data.data.end_time
        this.commitImg = res.data.data.detail
        this.switchValue = res.data.data.status === 1 ? true : false
        if (res.data.data.city === 1) {
          this.defalutCheckList.push('001')
          this.recipientCheckValus.push('001')
        }
        if (res.data.data.area === 1) {
          this.defalutCheckList.push('002')
          this.recipientCheckValus.push('002')
        }
        if (res.data.data.station === 1) {
          this.defalutCheckList.push('003')
          this.recipientCheckValus.push('003')
        }
        if (res.data.data.sms === 1) {
          this.checkValue.push('1')
        }
        this.form.setFieldsValue({
          fenceName: res.data.data.name,
          fenceLevel: res.data.data.level
        })
        return true
      })
    },
    // 接收人选择事件
    recipientChange(checkedValues) {
      this.recipientCheckValus = checkedValues
      console.log(this.recipientCheckValus)
    },
    // 提交
    commitResult(e) {
      const _this = this
      e.preventDefault()
      console.log(_this.commitImg)
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.openType === 1) {
            editFenceInfo('/electronic/edit/' + _this.id, {
              name: _this.form.getFieldsValue().fenceName,
              level: _this.form.getFieldsValue().fenceLevel,
              sms: _this.checkValue.length > 1 ? 1 : 0,
              type: _this.triggerType,
              city: _this.recipientCheckValus.indexOf('001') > -1 ? 1 : 0,
              area: _this.recipientCheckValus.indexOf('002') > -1 ? 1 : 0,
              station: _this.recipientCheckValus.indexOf('003') > -1 ? 1 : 0,
              status: _this.switchValue,
              start: _this.startTime,
              end: _this.endTime,
              detail: JSON.stringify(_this.commitImg)
            }).then(res => {
              if (res.status === 200) {
                _this.$message.success('修改成功')
                _this.$emit('getBaseContent')
                _this.closeParentPop()
              } else {
                _this.$message.warning(res.message)
              }
            })
          } else if (this.openType === 0) {
            addFenceInfo({
              name: _this.form.getFieldsValue().fenceName,
              level: _this.form.getFieldsValue().fenceLevel,
              sms: _this.checkValue.length > 1 ? 1 : 0,
              type: _this.triggerType,
              city: _this.recipientCheckValus.indexOf('001') > -1 ? 1 : 0,
              area: _this.recipientCheckValus.indexOf('002') > -1 ? 1 : 0,
              station: _this.recipientCheckValus.indexOf('003') > -1 ? 1 : 0,
              status: _this.switchValue,
              start: _this.startTime,
              end: _this.endTime,
              detail: JSON.stringify(_this.commitImg)
            }).then(res => {
              if (res.status === 200) {
                _this.$message.success('新增成功')
                _this.$emit('getBaseContent')
                _this.closeParentPop()
              } else {
                _this.$message.warning(res.message)
              }
            })
          }
        }
      })
    },
    handleSelectChange(value) {
      console.log(value)
      this.form.setFieldsValue({
        fenceLevel: value
      })
    },
    // 大地图弹窗OK回调
    handleOk(e) {
      // this.commitImg.addTo(this.map)
      console.log(this.commitImg)
      this.ModalText = 'The modal will be closed after two seconds'
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 500)
    },
    // 大地图弹窗取消回调
    handleCancel(e) {
      console.log('Clicked cancel button')
      this.visible = false
    },
    // 显示大地图
    showBigMap() {
      const _this = this
      this.visible = true
      this.$nextTick(() => {
        this.bigMap = L.map('bigMap', {
          minZoom: 5,
          maxZoom: 14,
          center: [25.1505, 114.735],
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
          crs: L.CRS.EPSG3857
        })
        L.tileLayer.chinaProvider('Geoq.Normal.Map', { maxZoom: 18, minZoom: 5 }).addTo(this.bigMap)
        let greenIcon = L.icon({
          iconUrl: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2474014982,2446291431&fm=15&gp=0.jpg',
          iconSize: [25, 25]
        })
        if (this.openType === 1) {
          if (_this.dataResult.detail.type === 1) {
            _this.baseImg = new L.Circle(
              [_this.dataResult.detail.data.lat, _this.dataResult.detail.data.lng],
              _this.dataResult.detail.data.radius,
              {
                weight: 5,
                color: '#3388ff',
                dashArray: '',
                fillOpacity: 0.2
              }
            ).addTo(this.bigMap)
          } else if (_this.dataResult.detail.type === 2 || _this.dataResult.detail.type === 0) {
            _this.baseImg = L.polygon(_this.dataResult.detail.data, {
              weight: 5,
              color: '#3388ff',
              dashArray: '',
              fillOpacity: 0.2
            }).addTo(this.bigMap)
          }
        }
        var layers = []
        var drawnItems = new L.FeatureGroup()
        this.bigMap.addLayer(drawnItems)
        var drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems
          }
        })
        this.bigMap.on(L.Draw.Event.CREATED, function(event) {
          var layer = event.layer
          drawnItems.addLayer(layer)
          // _this.commitImg = event
          if (event.layerType === 'circle') {
            _this.commitImg = {
              type: 1,
              data: {
                lat: event.layer._latlng.lat,
                lng: event.layer._latlng.lng,
                radius: event.layer.options.radius
              }
            }
          } else if (event.layerType === 'rectangle') {
            let arr = []
            for (let n = 0; n < event.layer._latlngs[0].length; n++) {
              arr.push([event.layer._latlngs[0][n].lat, event.layer._latlngs[0][n].lng])
            }
            _this.commitImg = {
              type: 0,
              data: arr
            }
          } else if (event.layerType === 'polygon') {
            let arr = []
            for (let n = 0; n < event.layer._latlngs[0].length; n++) {
              arr.push([event.layer._latlngs[0][n].lat, event.layer._latlngs[0][n].lng])
            }
            _this.commitImg = {
              type: 2,
              data: arr
            }
          }

          _this.roundList.push(event)
          if (_this.openType === 1) {
            _this.bigMap.removeLayer(_this.baseImg)
          }
          console.log(event)
        })
        if (_this.openType === 1) {
          _this.baseImg.addTo(_this.bigMap)
        }
      })
    },
    enterFun(index) {
      console.log(index)
      this.menuIndex = index
    },
    leaveFun() {
      this.menuIndex = 0
    },
    mapTools(index) {
      if (index == 1) {
        this.menuIndex = 1
        this.menuMapState = false
        this.menuDetailState = false
        this.menuGraphicsState = true
      } else {
        this.menuIndex = 2
        this.menuMapState = true
        this.menuGraphicsState = false
      }
    },
    // 显示电子围栏
    showMapDetail() {
      this.menuDetailState = true
      this.menuMapState = false
    },
    // 画圆
    round() {
      if (this.roundList.length > 0) {
        this.roundList.forEach(element => {
          this.bigMap.removeLayer(element.layer)
        })
      }
      var drawnItems = new L.FeatureGroup()
      this.bigMap.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Circle(this.bigMap, drawControl.options.circle).enable()
    },
    Rectangle() {
      if (this.roundList.length > 0) {
        this.roundList.forEach(element => {
          this.bigMap.removeLayer(element.layer)
        })
      }
      var drawnItems = new L.FeatureGroup()
      this.bigMap.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Rectangle(this.bigMap, drawControl.options.rectangle).enable()
    },
    polygon() {
      if (this.roundList.length > 0) {
        this.roundList.forEach(element => {
          this.bigMap.removeLayer(element.layer)
        })
      }
      var drawnItems = new L.FeatureGroup()
      this.bigMap.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Polygon(this.bigMap, drawControl.options.polygon).enable()
    },
    // 删除图形
    deleteGraphice(item, index) {
      console.log(item)
      console.log(index)
      this.roundList.splice(index, 1)
      this.map.removeLayer(item.layer)
    },
    // 控制图层的显示隐藏
    checkGraphics(item) {
      item.isCheck = !item.isCheck
      if (item.type == 1) {
        if (this.map.hasLayer(this.markers)) {
          this.map.removeLayer(this.markers)
          this.map.removeLayer(this.polyline)
        } else {
          this.map.addLayer(this.markers)
        }
      } else if (item.type == 2) {
        if (this.map.hasLayer(this.decorator)) {
          this.map.removeLayer(this.decorator)
        } else {
          this.map.addLayer(this.decorator)
        }
      }
    },
    // 画轨迹
    trackPath() {
      // 动态轨迹
      if (this.map.hasLayer(this.polyline)) {
        this.map.removeLayer(this.polyline)
      }
      this.map.closePopup()
      this.map.setZoom(8)
      this.polyline = L.motion
        .polyline(
          [
            [24.59, 118.305319],
            [25.59, 117.305319],
            [26.59, 116.305319],
            [24.59, 115.305319]
          ],
          {
            color: 'red'
          },
          {
            auto: true,
            duration: 3000
          }
        )
        .addTo(this.map)
    },
    closePop() {
      this.menuIndex = 0
      this.menuMapState = false
      this.menuDetailState = false
      this.menuGraphicsState = false
    },
    // 列表鼠标移入事件
    mouseOverFun(layer) {
      layer.setStyle({
        weight: 5,
        color: '#000',
        dashArray: '',
        fillOpacity: 0.2
      })
    },
    // 列表鼠标移出事件
    mouseOutFun(layer) {
      layer.setStyle({
        weight: 5,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0.2
      })
    },
    closeParentPop() {
      this.$emit('closePop')
    },
    triggerChange(e) {
      this.triggerType = e.target.value
    },
    startTimeChange(date, dateString) {
      this.startTime = dateString
      console.log(date, dateString)
    },
    endTimeChange(date, dateString) {
      this.endTime = dateString
      console.log(date, dateString)
    },
    statusChange(e) {
      this.switchValue = e ? 1 : 0
      console.log(e)
    }
  },
  created() {
    const _this = this
    // 获取基础数据
    if (this.openType === 1) {
      this.getBaseContent().then(res => {})
    }
  }
}
</script>
<style lang="less" scoped>
.model-pop {
  width: 70%;
  height: auto;
  display: flex;
  flex-direction: column;

  margin: 0 auto;
}
#map {
  height: 200px;
}
#bigMap {
  width: 670px;
  height: 600px;
}
.big-modal {
  position: relative;
}
.menu-box {
  position: absolute;
  top: 80px;
  right: 10px;
  z-index: 99999;
  display: flex;
  .draw-tools-item {
    width: 50px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    margin-right: 10px;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
