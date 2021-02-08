<template>
  <div class="map-box">
    <div id="map"></div>
    <div class="search-box">
      <a-input
        v-model="searchShipName"
        class="search-input"
        @keyup.enter="searchName"
        type="text"
        placeholder="请输入船名"
      />
      <a-button class="search-btn" type="primary" @click="searchName">搜索</a-button>
    </div>
    <div class="search-list" v-if="searchList.length > 0">
      <div
        class="search-item"
        v-for="(searchItem, searchIndex) in searchList"
        :key="searchIndex"
        @click="mapSearchShip(searchItem)"
      >
        {{ searchItem.name }}
      </div>
    </div>
    <div class="menu-box">
      <a href="#" class="menu-item" @click="mapTools(1)" :class="menuIndex == 1 ? 'menu-item-hover' : ''">图层显示</a>
      <a href="#" class="menu-item" @click="mapTools(2)" :class="menuIndex == 2 ? 'menu-item-hover' : ''">地图工具</a>
      <!-- 地图工具弹窗 -->
      <div class="map-tools-box" v-show="menuMapState">
        <div class="top-nav">
          <span>地图工具</span>
          <span style="cursor: pointer" @click="closePop">X</span>
        </div>
        <div class="menu-list-box">
          <div class="menu-item-box" @click="showMapDetail">电子围栏</div>
        </div>
      </div>
      <!-- 地图工具->电子围栏 -->
      <div class="map-detail-box" v-if="menuDetailState">
        <div class="top-nav">
          <span>电子围栏</span>
          <span style="cursor: pointer" @click="closePop">X</span>
        </div>
        <div class="detail-list-box">
          <div class="detail-item-box" @click="round">圆形</div>
          <div class="detail-item-box" @click="Rectangle">矩形</div>
          <div class="detail-item-box" @click="polygon">多边形</div>
        </div>
        <div class="graphics-list-box">
          <div
            class="graphics-item"
            @mouseover="mouseOverFun(item.layer)"
            @mouseout="mouseOutFun(item.layer)"
            v-for="(item, index) in roundList"
            :key="index"
          >
            <span>{{ item.layerType + (index + 1) }}</span>
            <span @click="deleteGraphice(item, index)" style="cursor: pointer">X</span>
          </div>
        </div>
      </div>
      <!-- 图层控制显示 -->
      <div class="graphics-toos-box" v-if="menuGraphicsState">
        <div class="top-nav">
          <span>图层显示</span>
          <span style="cursor: pointer" @click="closePop">X</span>
        </div>
        <div class="detail-list-box">
          <div class="detail-item-box" v-for="(item, index) in graphicsList" :key="index">
            <span class="detail-item-title">{{ item.title }}</span>
            <div class="detail-children-item-box">
              <div
                class="detail-children-item"
                v-for="(childrenItem, childrenIndex) in item.children"
                :key="childrenIndex"
                :class="childrenItem.isCheck ? 'detail-children-item-check' : ''"
                @click="checkGraphics(childrenItem)"
              >
                {{ childrenItem.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lat-box">
        {{ latDetail }}
      </div>
      <a-modal
        :centered="true"
        title="日期选择"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
        @cancel="handleCancel"
        :width="widths"
        class="big-modal"
        okText="确定"
        cancelText="取消"
      >
        <span>开始时间：</span>
        <a-date-picker v-model="startTime" @change="startTimeChange" placeholder="请选择" />
        <span style="margin-left:20px">结束时间：</span>
        <a-date-picker v-model="endTime" @change="endTimeChange" placeholder="请选择"/>
      </a-modal>
    </div>
  </div>
</template>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<script>
import 'leaflet-polylinedecorator/dist/leaflet.polylineDecorator'
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders'
import 'leaflet.motion/dist/leaflet.motion.min'
import 'leaflet-draw/dist/leaflet.draw'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import { mapInfo, searchShip, searchShipInfo } from '@/api/manage'
export default {
  data() {
    return {
      map: null,
      roundR: 0,
      roundI: null,
      roundC: 0,
      roundCircle: new L.circle(),
      menuIndex: 0,
      menuMapState: false, //地图工具菜单
      menuDetailState: false, //地图工具具体项目菜单
      roundList: [], //存放绘画完成的数据
      menuGraphicsState: false, //图层菜单
      markerGroup: [], //存放定点信息集合
      decorator: null, //虚线
      polyline: null, //轨迹线
      markers: null,
      latDetail: '', //经纬度鼠标移动信息
      graphicsList: [
        {
          title: '水文气象',
          children: [
            {
              name: '船只',
              isCheck: true,
              type: 1
            },
            {
              name: '沿海基线',
              isCheck: true,
              type: 2
            }
          ]
        },
        {
          title: '基础数据',
          children: [
            // {
            //   name: '海岸线',
            //   isCheck: false,
            //   type: 3
            // },
            // {
            //   name: '共同鱼区',
            //   isCheck: false,
            //   type: 4
            // },
            {
              name: '电子围栏',
              isCheck: false,
              type: 5
            }
          ]
        }
      ],
      boatList: [], // 船集合
      fenceList: [], // 电子围栏数据集合
      fenceLayerList: [], // 电子围栏layer集合
      searchShipName: '', // 搜索条件
      searchList: [], // 搜索结果集合
      visible: false, // 显示轨迹回放时间选择
      widths: 600,
      confirmLoading: false,
      startTime: null,
      endTime: null,
      checkShipId: '',
      greenIcon: null,
      shipRound:null // 选中船只的圈
    }
  },
  watch: {
    searchShipName(newValue, oldValue) {
      if (newValue == '') {
        this.searchList = []
      }
    }
  },
  methods: {
    GetDateStr(AddDayCount) {
      var dd = new Date()

      dd.setDate(dd.getDate() + AddDayCount) //获取AddDayCount天后的日期

      var y = dd.getFullYear()

      var m = dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1 //获取当前月份的日期，不足10补0

      var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate() //获取当前几号，不足10补0

      return y + '-' + m + '-' + d
    },
    getBaseContent() {
      const _this = this
      return mapInfo().then(res => {
        _this.fenceList = res.data.fence
        for (let n = 0; n < res.data.boat.length; n++) {
          _this.boatList.push({
            lat: res.data.boat[n].latitude,
            lng: res.data.boat[n].longitude,
            name: res.data.boat[n].name,
            id: res.data.boat[n].id
          })
        }
        return true
      })
    },
    // 搜索
    searchName() {
       console.log(this.map)
      searchShip({
        kw: this.searchShipName
      }).then(res => {
        this.searchList = res.data
      })
    },
    // 查询船只位置
    mapSearchShip(item) {
      this.searchShipName = item.name
      if(this.map.hasLayer(this.shipRound)){
        this.map.removeLayer(this.shipRound)
      }
     this.shipRound = new L.Circle([item.latitude, item.longitude],1200,{
        color:'red',
        fillColor:'#F03',
        fillOpacity:0
      })
      this.shipRound.bindTooltip('点击船只查询轨迹')
      this.shipRound.addTo(this.map)
      this.map.panTo(new L.latLng(item.latitude, item.longitude))
      setTimeout(() => {
        this.map.setZoom(13)
      }, 500)
      this.searchList = []
    },
    // 轨迹回放
    handleOk(e) {
      searchShipInfo({
        boat: this.checkShipId,
        start: this.startTime,
        end: this.endTime
      }).then(res => {
        let arr = []
        if (res.data.length === 0) {
          this.$message.warning('暂无回放轨迹')
          this.map.closePopup()
        } else {
          for (let n = 0; n < res.data.length; n++) {
            arr.push([res.data[n].lat, res.data[n].lng])
          }
          // 动态轨迹
          if (this.map.hasLayer(this.polyline)) {
            this.map.removeLayer(this.polyline)
          }
          console.log(arr)
          this.map.closePopup()
          this.map.panTo(new L.latLng(arr[0][0], arr[0][1]))
          setTimeout(() => {
            this.map.setZoom(12)
            this.polyline = L.motion
              .polyline(
                arr,
                {
                  color: '#000080'
                },
                {
                  auto: true,
                  duration: 3000
                }
              )
              .addTo(this.map)
          }, 500)
        }
      })
      this.visible = false
      // setTimeout(() => {
      //   this.visible = false
      //   this.confirmLoading = false
      // }, 500)
    },
    // 大地图弹窗取消回调
    handleCancel(e) {
      console.log('Clicked cancel button')
      this.visible = false
    },
    startTimeChange(date, dateString) {
      this.startTime = dateString
    },
    endTimeChange(date, dateString) {
      this.endTime = dateString
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
      var drawnItems = new L.FeatureGroup()
      this.map.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Circle(this.map, drawControl.options.circle).enable()
    },
    Rectangle() {
      var drawnItems = new L.FeatureGroup()
      this.map.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Rectangle(this.map, drawControl.options.rectangle).enable()
    },
    polygon() {
      var drawnItems = new L.FeatureGroup()
      this.map.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      new L.Draw.Polygon(this.map, drawControl.options.polygon).enable()
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
      } else if (item.type == 5) {
        if (this.map.hasLayer(this.fenceLayerList)) {
          this.map.removeLayer(this.fenceLayerList)
        } else {
          this.map.addLayer(this.fenceLayerList)
        }
      }
    },
    // 画轨迹
    trackPath(id) {
      this.startTime = this.GetDateStr(-2)
      this.endTime = this.GetDateStr(0)
      this.checkShipId = id
      this.visible = true
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
    }
  },
  mounted() {
    this.getBaseContent().then(res => {
      window.trackPath = this.trackPath
      const _this = this

      // this.map = L.map('map').setView([24.26, 118.04], 6)
      let map = L.map('map', {
        minZoom: 6,
        maxZoom: 12,
        center: [24.59, 116.114129],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
        crs: L.CRS.EPSG3857
      })
      this.map = map
      this.map.on('zoomend ', function (e) {
        if(e.target.getZoom()<=9) {
          if(_this.map.hasLayer(_this.shipRound)){
            _this.map.removeLayer(_this.shipRound)
          }
        }
      })
      // 加载谷歌地图
      L.tileLayer('http://pngchart.ehanghai.cn/ceshiban/{z}/{y}/{x}.png', { maxZoom: 18, minZoom: 5 }).addTo(this.map)
      // L.tileLayer.chinaProvider('Geoq.Normal.Map', { maxZoom: 18, minZoom: 5 }).addTo(this.map)
      this.greenIcon = L.icon({
        iconUrl: 'http://sea.zehuo.cn/images/ship.png',
        iconSize: [25, 25]
      })
      // 添加比例尺
      L.control.scale({ maxWidth: 150, metric: true, imperial: false }).addTo(this.map)
      this.map.on('mousemove', function(e) {
        _this.latDetail = 'lat:' + e.latlng.lat.toFixed(4) + '  ' + 'lng:' + e.latlng.lng.toFixed(4)
        console.log()
      })
      var layers = []
      this.markers = L.markerClusterGroup()
      // 添加船只
      for (let i = 0; i < _this.boatList.length; i++) {
        // var redIcon = L.icon({
        //   iconUrl: redMarker,
        //   iconSize: [25, 41],
        //   iconAnchor: [13, 21],
        // })
        var tipContent = '<p>'
        tipContent += '船名:'
        tipContent += _this.boatList[i].name + '</br>'
        tipContent += 'lat:'
        tipContent += _this.boatList[i].lat + '</br>'
        tipContent += 'lng:'
        tipContent += _this.boatList[i].lng + '</br>'
        tipContent +=
          ' <button style="cursor: pointer;margin-top:10px" onClick="trackPath(' +
          this.boatList[i].id +
          ')">轨迹回放</button>'
        tipContent += '</p>'
        var layer = new L.marker([_this.boatList[i].lat, _this.boatList[i].lng], { icon: _this.greenIcon })
          .bindPopup(tipContent)
          .openPopup()
        layers.push(layer)
        this.markers.addLayer(layer)
      }
      this.markerGroup = L.layerGroup(layers)
      // this.map.addLayer(this.markerGroup)
      this.map.addLayer(this.markers)
      // L.marker([24.26, 118.04]).addTo(this.map)
      // 添加电子围栏
      var fenceLayerGroup = []
      _this.fenceList.forEach(item => {
        var baseContent
        if (item.detail.type === 1) {
          baseContent = new L.Circle([item.detail.data.lat, item.detail.data.lng], item.detail.data.radius, {
            weight: 5,
            color: '#3388ff',
            dashArray: '',
            fillOpacity: 0.2
          })
        } else if (item.detail.type === 2 || item.detail.type === 0) {
          baseContent = L.polygon(item.detail.data, {
            weight: 5,
            color: '#3388ff',
            dashArray: '',
            fillOpacity: 0.2
          })
        }
        fenceLayerGroup.push(baseContent)
      })
      _this.fenceLayerList = L.layerGroup(fenceLayerGroup)
      // _this.map.addLayer(_this.fenceLayerList)
      console.log(_this.fenceLayerList)
      // 虚线
      this.decorator = L.polylineDecorator(
        [
          [26.066, 121.453],
          [25.090, 120.668],
          [24.742, 120.734],
          [24.1774, 120.338],
          [24.172, 119.893],
          [22.871, 118.751]
        ],
        {
          patterns: [
            // defines a pattern of 10px-wide dashes, repeated every 20px on the line
            { offset: 0, repeat: 20, symbol: L.Symbol.dash({ pixelSize: 10 }) }
          ]
        }
      ).addTo(this.map)
      var drawnItems = new L.FeatureGroup()
      this.map.addLayer(drawnItems)
      var drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        }
      })
      // this.map.addControl(drawControl)
      this.map.on(L.Draw.Event.CREATED, function(event) {
        var layer = event.layer
        event.layer.on('mouseover', function() {
          layer.bindTooltip('右键删除')
          layer.setStyle({
            weight: 5,
            color: '#000',
            dashArray: '',
            fillOpacity: 0.2
          })
        })
        event.layer.on('mouseout', function() {
          layer.setStyle({
            weight: 5,
            color: '#3388ff',
            dashArray: '',
            fillOpacity: 0.2
          })
        })
        event.layer.on('contextmenu', function() {
          for (let n = 0; n < _this.roundList.length; n++) {
            if (_this.roundList[n].layer._leaflet_id == layer._leaflet_id) {
              _this.roundList.splice(n, 1)
              _this.map.removeLayer(layer)
              return
            }
          }

          // console.log(layer)
        })
        drawnItems.addLayer(layer)
        _this.roundList.push(event)
        console.log(event)
      })
    })
  }
}
</script>

<style lang="less" scoped>
.map-box {
  width: 100%;
  height: 88vh;
  max-height: 100vh;
  position: relative;
}
#map {
  width: 100%;
  height: 100%;
}
.map-box .menu-box {
  width: 200px;
  height: 40px;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 996;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  .map-tools-box {
    position: absolute;
    top: 50px;
    right: 0px;
    background: #fff;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    width: 375px;
    height: 296px;
    z-index: 99999;
    .top-nav {
      width: 100%;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
      margin: 0;
      color: #333;
      padding: 0 10px;
      background: #f8f8f8;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .menu-list-box {
      display: flex;
      padding: 20px;
      box-sizing: border-box;
      .menu-item-box {
        cursor: pointer;
      }
    }
  }
  .map-detail-box {
    position: absolute;
    top: 50px;
    right: 0px;
    background: #fff;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    width: 375px;
    height: auto;
    z-index: 99999;
    .top-nav {
      width: 100%;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
      margin: 0;
      color: #333;
      padding: 0 10px;
      background: #f8f8f8;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .detail-list-box {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      padding: 20px;
      .detail-item-box {
        cursor: pointer;
      }
    }
    .graphics-list-box {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      padding-bottom: 20px;
      .graphics-item {
        padding: 0 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
      }
    }
  }
  .graphics-toos-box {
    position: absolute;
    top: 50px;
    right: 0px;
    background: #fff;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    width: 375px;
    height: auto;
    z-index: 99999;
    .top-nav {
      width: 100%;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
      margin: 0;
      color: #333;
      padding: 0 10px;
      background: #f8f8f8;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .detail-list-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 20px;
      .detail-item-box {
        // width: 115px;
        // height: 30px;
        // line-height: 30px;
        // margin-right: 5px;
        // margin-top: 5px;
        // border: 1px solid #e4e8ec;
        // border-radius: 3px;
        // padding: 0 5px;
        // font-size: 14px;
        // color: #666;
        display: flex;
        flex-direction: column;
        .detail-children-item-box {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-wrap: wrap;
          width: 100%;
          .detail-children-item {
            width: 115px;
            height: 30px;
            line-height: 30px;
            margin-right: 5px;
            margin-top: 5px;
            border: 1px solid #e4e8ec;
            border-radius: 3px;
            padding: 0 5px;
            font-size: 14px;
            color: #666;
            text-align: center;
            cursor: pointer;
          }
          .detail-children-item-check {
            border: 1px solid #2c6fff;
            color: #2c6fff;
          }
        }
      }
    }
  }
  .menu-item {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    color: #000;
  }
  .menu-item-hover {
    color: blue !important;
  }
}
.lat-box {
  position: fixed;
  bottom: 5px;
  left: 440px;
  z-index: 999;
  font-size: 18px;
  color: #000;
}
.search-box {
  position: absolute;
  top: 10px;
  left: 30px;
  z-index: 996;
  display: flex;
  align-items: center;
  width: 300px;
  height: 40px;
  .search-input {
    width: 100%;
    height: 100%;
  }
  .search-btn {
    height: 100%;
  }
}
.search-list {
  position: absolute;
  top: 50px;
  left: 30px;
  width: 300px;
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  z-index: 9999;
  border: 1px solid #f2f2f2;
  .search-item {
    width: 100%;
    height: 40px;
    padding-left: 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f2f2f2;
    cursor: pointer;
    &:hover {
      background-color: #f2f2f2;
    }
  }
}
</style>
