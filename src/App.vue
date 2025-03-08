<template>
  <div class="app-container">
    <!-- 可拖动区域 -->
    <div class="app-titlebar">
      <!-- <div class="window-title">班大师Ai研究所</div> -->
    </div>
    
    <!-- 不可拖动的内容区域 -->
    <div class="app-content-wrapper">
      <header class="app-header">
        <h1>班大师Ai研究所</h1>
        <button class="settings-btn" @click="openSettings">
          <span class="icon">⚙️</span>
        </button>
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 50px;
  padding-bottom: 50px;
}

/* 可拖动区域样式 */
.app-titlebar {
  height: 40px;
  background-color: rgba(46, 52, 64, 0.8); /* 半透明深色背景 */
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  color: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  -webkit-app-region: drag; /* 使区域可拖动 */
  user-select: none; /* 防止文本选择 */
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  border-bottom: 1px solid var(--glass-border);
  z-index: 1000;
}

.window-title {
  font-size: 14px;
  font-weight: 500;
}

/* 不可拖动内容区域 */
.app-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: transparent; /* 保持原有背景 */
  -webkit-app-region: no-drag; /* 确保内容区域不可拖动 */
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  -webkit-app-region: no-drag;
}

/* 确保按钮可以点击 */
.settings-btn {
  -webkit-app-region: no-drag;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.settings-btn:hover {
  transform: rotate(45deg);
}

.icon {
  display: inline-block;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
}

.app-content {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  background-color: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -4px 16px -8px rgba(31, 38, 135, 0.2);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
</style>