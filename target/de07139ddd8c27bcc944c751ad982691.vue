<!--
 * @Author: your name
 * @Date: 2021-01-25 11:37:02
 * @LastEditTime: 2021-04-09 18:23:37
 * @LastEditors: wangzhu
 * @Description: In User Settings Edit
 * @FilePath: /cactus-data/src/pages/afterClassEvaluate/components/evalutionStar.vue
-->
<template>
  <div class="evalutionStar">
    <starModeOne v-for="(i, index) in dataList" :key="index" :data="i" :starNum="starNum" />
  </div>
</template>

<script>
// import { mapActions, mapState, mapMutations, mapGetters } from 'vuex'
import starModeOne from '@/components/starModeOne/index.vue'
export default {
  // mixins: [mixinName],
  components: { starModeOne },
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    starNum: {
      required: true
    }
  },
  data () {
    return {
      key: 'value'
    }
  },
  created () {},
  methods: {
    // async requestData () {
    //   const resData = await getData(params)
    //   const { ok, data, message } = resData
    //   if (!ok) return this.message.error(message)
    // },
  }
}
</script>

<style scoped lang="scss">
.evalutionStar{
    margin-left: 58px;
    .starModeOne{
        margin-top: 17px;
    }
}
</style>
