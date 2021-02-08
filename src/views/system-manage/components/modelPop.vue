<template>
  <div class="more-detail">
    <a-card :bordered="false">
      <div class="model-pop">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <!-- <a-form-item label="主管部门">
            <a-tree-select
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
              @change="depChange"
              v-decorator="['competentDep', { rules: [{ required: true, message: '请选择主管部门' }] }]"
            >
              <a-tree-select-node
                v-for="(firstItem, firstIndex) in cascaderList[0]"
                :key="'first' + firstIndex"
                :value="firstItem.id"
                :title="firstItem.name"
              >
                <a-tree-select-node
                  v-for="(secondItem, secondIndex) in firstItem.area"
                  :key="'second' + secondIndex + 1"
                  :value="secondItem.id"
                  :title="secondItem.name"
                >
                  <a-tree-select-node
                    v-for="(threeItem, threeIndex) in secondItem.station"
                    :key="threeIndex"
                    :value="threeItem.id"
                    :title="threeItem.name"
                  >
                  </a-tree-select-node>
                </a-tree-select-node>
              </a-tree-select-node>
            </a-tree-select>
          </a-form-item> -->
          <a-form-item label="选择港口">
            <a-select style="width: 100%" placeholder="请选择" @change="habourChange" v-model="habourId">
              <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in habourList" :key="levelIndex">{{
                levelItem.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="区域名称">
            <a-input
              placeholder="请输入区域名称"
              v-decorator="['areaName', { rules: [{ required: false, message: '请填写区域名称' }] }]"
            />
          </a-form-item>
          <a-form-item label="选择区域范围">
            <a-select style="width: 100%" placeholder="请选择" @change="rangeChange" v-model="range">
              <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in rangeList" :key="levelIndex">{{
                levelItem.name + '米'
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="是否开启短信通知">
            <a-switch :checked="isOpenSms==1?true:false" @change="contactChange($event)"/>
          </a-form-item>
          <!-- <a-form-item label="港口位置">
            <a-input placeholder="请输入港口地址" v-model="city" id="suggestId" name="address_detail"></a-input>
          </a-form-item> -->
          <div id="allmap" />
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit" @click="commitResult">
              提交
            </a-button>
            <a-button style="margin-left:20px" @click="closeParentPop">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script>
import { getAllDep } from '@/api/ship-api'
import { harbourInfo, editHarbour, addHarbour, getAllHarbour, addArea} from '@/api/systemManage-api'
import { BmGeolocation, BmLocalSearch, BmNavigation, BmMarker } from 'vue-baidu-map'
import moment from 'moment'
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
      dataResult: [], // 页面数据
      patternType: '', // 图案类型
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      cascaderList: [], // 主管部门列表
      city: '',
      addressLng: { lat: '24.2646', lng: '118.0404' }, // 地址的经纬度
      address_detail: null, //详细地址
      defaultZoom: 10,
      userlocation: [],
      myGeo: null,
      rangeList: [
        {
          id: 50,
          name: 50,
          value:50
        },
        {
          id: 100,
          name: 100,
          value: 100
        },
        {
          id: 150,
          name: 150,
          value: 150

        },
        {
          id: 200,
          name: 200,
          value: 200
        },
        {
          id: 250,
          name: 250,
          value: 250
        },
        {
          id: 300,
          name: 300,
          value: 300
        }
      ],

      range: 50,
      habourList:[],
      habourId:undefined,
      isOpenSms:0
    }
  },
  components: {
    // 手动定位控件
    BmGeolocation,
    // 检索控件
    BmLocalSearch,
    // 地图放大缩小控件
    BmNavigation,
    // marker控件
    BmMarker
  },
  methods: {
    moment,
    // 获取基础信息
    getBaseContent() {
      const _this = this
      harbourInfo('/area/editArea/' + this.id).then(res => {
        _this.addressLng = { lat: res.data.lat, lng: res.data.lng }
        _this.getcity(_this.addressLng)
        //  _this.city = res.data.address
        setTimeout(() => {
          _this.city = res.data.address
        }, 200)
        _this.defaultZoom = 17
        _this.habourId = res.data.harbour_id
        _this.range = res.data.range
        _this.isOpenSms = res.data.sms
        _this.form.setFieldsValue({
          areaName: res.data.name,

          competentDep: res.data.department
        })
      })
    },
    depChange(e) {},
    // 关闭窗口
    closeParentPop() {
      this.$emit('closePop')
    },
    // 提交
    commitResult() {
      const _this = this
      console.log(this.form.getFieldsValue().competentDep)
      if (this.habourId === undefined) {
        this.$message.warning('请选择港口')
        return
      } else if (this.form.getFieldsValue().areaName === undefined) {
        this.$message.warning('请填写港口名称')
        return
      }else {
        if (this.openType === 1) {
          addArea({
            id: this.id,
            name: this.form.getFieldsValue().areaName,
            range: this.range,
            sms: this.isOpenSms,
            lat: this.addressLng.lat,
            lng: this.addressLng.lng,
            harbour_id:this.habourId
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('修改成功')
              _this.closeParentPop()
              _this.$emit('getBaseContent')
            } else {
              _this.$message.warning(res.message)
            }
          })
        } else {
          addArea({
            name: this.form.getFieldsValue().areaName,
            range: this.range,
            sms: this.isOpenSms,
            lat: this.addressLng.lat,
            lng: this.addressLng.lng,
            harbour_id:this.habourId
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('新建成功')
              _this.closeParentPop()
              _this.$emit('getBaseContent')
            } else {
              _this.$message.warning(res.message)
            }
          })
        }
      }
    },
    getcity(addressLng) {
      this.$nextTick(function() {
        var th = this
        // 创建Map实例
        var map = new BMap.Map('allmap')
        // 初始化地图,设置中心点坐标，
        var point = new BMap.Point(addressLng.lng, addressLng.lat) // 创建点坐标，
        map.centerAndZoom(point, th.defaultZoom)
        map.enableScrollWheelZoom()
        if (th.openType === 1) {
          map.addOverlay(new BMap.Marker(addressLng))
        }
        // var ac = new BMap.Autocomplete({
        //   // 建立一个自动完成的对象
        //   input: 'suggestId',
        //   location: map
        // })
        var myValue
        // ac.addEventListener('onconfirm', function(e) {
        //   // 鼠标点击下拉列表后的事件
        //   var _value = e.item.value //获取点击的条目
        //   myValue = _value.province + _value.city + _value.district + _value.street + _value.business //地址拼接赋给一个变量
        //   th.city = myValue //将地址赋给data中的city
        //   // console.log(th.city)
        //   setPlace()
        // })
        function setPlace() {
          map.clearOverlays() // 清除地图上所有覆盖物
          function myFun() {
            th.userlocation = local.getResults().getPoi(0).point // 获取第一个智能搜索的结果
            map.centerAndZoom(th.userlocation, 18)
            map.addOverlay(new BMap.Marker(th.userlocation)) // 添加标注
            th.addressLng = th.userlocation
            console.log(th.userlocation)
          }

          var local = new BMap.LocalSearch(map, {
            // 智能搜索
            onSearchComplete: myFun
          })
          local.search(myValue)
          // 测试输出坐标（指的是输入框最后确定地点的经纬度）
          map.addEventListener('click', function(e) {
            // 经度
            console.log(th.userlocation.lng)
            // 纬度
            console.log(th.userlocation.lat)
          })
        }
        map.addEventListener('click', function(e) {
          map.clearOverlays() // 清除地图上所有覆盖物
          map.addOverlay(new BMap.Marker(e.Ag)) // 添加标注
          th.myGeo.getLocation(e.Ag, function(result) {
            th.addressLng.lat = result.point.lat
            th.addressLng.lng = result.point.lng
          })
        })
      })
    },
    rangeChange(value) {
      this.range = value
    },
    habourChange (value) {
      this.habourId = value
    },
            // 联络人设置
    contactChange (checked) {
      this.isOpenSms = checked?1:0
    }
  },
  created() {
    this.myGeo = new BMap.Geocoder()
    const _this = this
    getAllDep().then(res => {
      this.cascaderList = res.data
    })
    getAllHarbour().then((res) => {
          this.habourList = res.data
      })
    // 获取基础数据
    if (this.openType === 1) {
      this.getBaseContent()
    } else {
      this.getcity(this.addressLng)
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
#allmap {
  height: 500px;
}
</style>
