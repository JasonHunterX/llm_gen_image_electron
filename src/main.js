import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import './assets/styles/main.css';

// 创建Vue应用并挂载
const app = createApp(App);
app.use(store);
app.mount('#app');

// 添加全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err);
  console.error('错误信息:', info);
};