<template>
  <div class="more-detail">
    <a-card :bordered="false">
      <div class="model-pop">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="主管部门">
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
          </a-form-item>
          <a-form-item label="港口名称">
            <a-input
              placeholder="请输入港口名称"
              v-decorator="['fenceName', { rules: [{ required: true, message: '请填写围栏名称' }] }]"
            />
          </a-form-item>
          <a-form-item label="港口位置">
            <a-input placeholder="请输入港口地址" v-model="city" id="suggestId" name="address_detail"></a-input>
          </a-form-item>
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
import { harbourInfo, editHarbour, addHarbour } from '@/api/systemManage-api'
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
    }
  },
  methods: {
    moment,
    // 获取基础信息
    getBaseContent() {
      const _this = this
      harbourInfo('/harbour/edit/' + this.id).then(res => {
        _this.addressLng = { lat: res.data.lat, lng: res.data.lng }
          _this.getcity(_this.addressLng)
        //  _this.city = res.data.address
        setTimeout(()=>{
            _this.city = res.data.address
        },200)
        _this.defaultZoom = 17
        _this.form.setFieldsValue({
          fenceName: res.data.name,
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
      if (this.form.getFieldsValue().competentDep === undefined) {
        this.$message.warning('请选择主管部门')
        return
      } else if (this.form.getFieldsValue().fenceName === undefined) {
        this.$message.warning('请填写港口名称')
        return
      } else if (this.city === '') {
        this.$message.warning('请选择港口位置')
        return
      } else {
        if (this.openType === 1) {
          editHarbour({
            id: this.id,
            name: this.form.getFieldsValue().fenceName,
            address: this.city,
            department_id: this.form.getFieldsValue().competentDep,
            lat: this.addressLng.lat,
            lng: this.addressLng.lng
          }).then((res) => {
            if (res.status === 200) {
              _this.$message.success('修改成功')
              _this.closeParentPop()
              _this.$emit('getBaseContent')
            } else{
              _this.$message.warning(res.message)
            }
          })
        } else {
          addHarbour({
            name: this.form.getFieldsValue().fenceName,
            address: this.city,
            department_id: this.form.getFieldsValue().competentDep,
            lat: this.addressLng.lat,
            lng: this.addressLng.lng
          }).then((res) => {
            if (res.status === 200) {
              _this.$message.success('新建成功')
              _this.closeParentPop()
              _this.$emit('getBaseContent')
            } else{
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
        var point = new BMap.Point(addressLng.lng, addressLng.lat) // 创建点坐标，汉得公司的经纬度坐标
        map.centerAndZoom(point, th.defaultZoom)
        map.enableScrollWheelZoom()
        if (th.openType === 1) {
          map.addOverlay(new BMap.Marker(addressLng))
        }
        var ac = new BMap.Autocomplete({
          // 建立一个自动完成的对象
          input: 'suggestId',
          location: map
        })
        var myValue
        ac.addEventListener('onconfirm', function(e) {
          // 鼠标点击下拉列表后的事件
          var _value = e.item.value //获取点击的条目
          myValue = _value.province + _value.city + _value.district + _value.street + _value.business //地址拼接赋给一个变量
          th.city = myValue //将地址赋给data中的city
          // console.log(th.city)
          setPlace()
        })
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
      })
    }
  },
  created() {
    const _this = this
    getAllDep().then(res => {
      this.cascaderList = res.data
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
