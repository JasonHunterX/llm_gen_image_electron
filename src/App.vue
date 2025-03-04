<template>
  <div class="app-container">
    <!-- 可拖动区域 -->
    <div class="app-titlebar" style="-webkit-app-region: drag">
      <div class="titlebar-content">
        <!-- 预留拖动空间 -->
      </div>
    </div>
    
    <!-- 其他内容保持不变 -->
    <div class="app-content-wrapper">
      <header class="app-header">
        <div class="header-content">
          <h1>班大师Ai研究所</h1>
          <button class="settings-btn" @click="openSettings">
            <span class="icon">⚙️</span>
          </button>
        </div>
      </header>
      <main class="app-content">
        <HomeView />
      </main>
      <footer class="app-footer">
        <p>© 班大师Ai研究所</p>
      </footer>
    </div>
    
    <!-- 设置模态窗口 -->
    <SettingsModal 
      :is-open="isSettingsOpen" 
      @close="closeSettings"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import HomeView from './views/HomeView.vue';
import SettingsModal from './components/SettingsModal.vue';

export default {
  name: 'App',
  components: {
    HomeView,
    SettingsModal
  },
  setup() {
    const isSettingsOpen = ref(false);
    
    const openSettings = () => {
      isSettingsOpen.value = true;
    };
    
    const closeSettings = () => {
      isSettingsOpen.value = false;
    };
    
    return {
      isSettingsOpen,
      openSettings,
      closeSettings
    };
  }
}
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f3e6 0%, #f0f7ea 100%);
}

/* 添加拖动区域样式 */
.app-titlebar {
  height: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #a8d5a8;
  position: relative;
  z-index: 1000;
}

.titlebar-content {
  height: 100%;
  padding: 0 1rem;
}

/* 确保按钮区域不可拖动 */
.settings-btn {
  -webkit-app-region: no-drag;
}

/* 添加新的样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c5a1e;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.app-header {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem 2rem;
  border-bottom: 1px solid #a8d5a8;
}

.app-header h1 {
  color: #2c5a1e;
  font-size: 1.8rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.settings-btn {
  background-color: #7ab55c;
}

.app-footer {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  text-align: center;
  color: #2c5a1e;
  border-top: 1px solid #a8d5a8;
}
</style>