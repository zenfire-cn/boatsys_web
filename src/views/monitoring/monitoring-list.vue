<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="所属类目" block style="padding-bottom: 11px">
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">类目一</tag-select-option>
              <tag-select-option value="Category2">类目二</tag-select-option>
              <tag-select-option value="Category3">类目三</tag-select-option>
              <tag-select-option value="Category4">类目四</tag-select-option>
              <tag-select-option value="Category5">类目五</tag-select-option>
              <tag-select-option value="Category6">类目六</tag-select-option>
              <tag-select-option value="Category7">类目七</tag-select-option>
              <tag-select-option value="Category8">类目八</tag-select-option>
              <tag-select-option value="Category9">类目九</tag-select-option>
              <tag-select-option value="Category10">类目十</tag-select-option>
              <tag-select-option value="Category10">类目十</tag-select-option>
              <tag-select-option value="Category10">类目十</tag-select-option>
              <tag-select-option value="Category10">类目十</tag-select-option>
              <tag-select-option value="Category10">类目十</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="详细条件" grid last>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
              <a-form-item label="ip地址" :wrapper-col="{ xs: 24, sm: 24, md: 12 }">
                <a-input placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
              <a-form-item label="编号/名称" :wrapper-col="{ xs: 24, sm: 24, md: 12 }">
                <a-input placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-button type="primary">查询</a-button>
            <a-button style="color: #000; margin-left: 10px">重置</a-button>
          </a-row>
        </standard-form-row>
      </a-form>
    </a-card>
    <a-list
      rowKey="id"
      :grid="{ gutter: 24, lg: 4, md: 2, sm: 1, xs: 1 }"
      :dataSource="dataSource"
      style="margin-top: 50px"
      :loading="loading"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        <template>
          <a-card hoverable>
            <img slot="cover" alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
            <a-card-meta title="Europe Street beat">
              <a slot="title">{{ item.title }}</a>
              <div class="meta-content" slot="description">{{ item.content }}</div>
            </a-card-meta>
          </a-card>
        </template></a-list-item
      ></a-list
    ></page-header-wrapper
  >
</template>

<script>

import { TagSelect, StandardFormRow, ArticleListContent } from '@/components'

// import IconText from '/components/IconText'
const TagSelectOption = TagSelect.Option

export default {
  components: {
    TagSelect,
    TagSelectOption,
    StandardFormRow,
    ArticleListContent
  },
  data () {
    return {
      loading: true,
      loadingMore: false,
      data: [],
      form: this.$form.createForm(this),
      dataSource: []
    }
  },
  mounted () {
    for (let i = 0; i < 11; i++) {
  this.dataSource.push({
    id: i,
    title: 'Alipay',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
    content: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。'
  })
}
this.loading = false
  },
  methods: {
    handleChange (value) {
      console.log(`selected ${value}`)
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/components/index.less';
.ant-pro-components-tag-select {
  /deep/ .ant-pro-tag-select .ant-tag {
    margin-right: 24px;
    padding: 0 8px;
    font-size: 14px;
  }
}
.card-list {
  /deep/ .ant-card-body:hover {
    .ant-card-meta-title > a {
      color: @primary-color;
    }
  }

  /deep/ .ant-card-meta-title {
    margin-bottom: 12px;

    & > a {
      display: inline-block;
      max-width: 100%;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  /deep/ .meta-content {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    height: 64px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    margin-bottom: 1em;
  }
}
.list-articles-trigger {
  margin-left: 12px;
}
.ant-card-actions {
  background: #f7f9fa;

  li {
    float: left;
    text-align: center;
    margin: 12px 0;
    color: rgba(0, 0, 0, 0.45);
    width: 50%;

    &:not(:last-child) {
      border-right: 1px solid #e8e8e8;
    }

    a {
      color: rgba(0, 0, 0, 0.45);
      line-height: 22px;
      display: inline-block;
      width: 100%;
      &:hover {
        color: @primary-color;
      }
    }
  }
}
/deep/ .ant-btn {
  color: #fff;
  margin-top: 4px;
}
</style>
