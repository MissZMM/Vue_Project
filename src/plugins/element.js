import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 将弹框组件挂载到vue的原型对象上，每个组件都可访问$message
Vue.prototype.$message = Message
