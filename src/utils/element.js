import Vue from 'vue'
import {
  Button,
  Select,
  Input,
  Form,
  FormItem,
  Table,
  TableColumn,
  Progress,
  Message
} from 'element-ui'

const components = [
  Button,
  Select,
  Input,
  Form,
  FormItem,
  Table,
  TableColumn,
  Progress
]
Vue.prototype.$message = Message
export default {
  install(Vue, options = {}) {
    components.map(item => {
      Vue.use(item)
    })
  }
}
