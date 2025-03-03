<template>
  <div class="popup-container">
    <header class="popup-header">
      <h1>班大师AI研究所</h1>
      <button class="settings-btn" @click="openSettings">
        <span class="icon">⚙️</span>
      </button>
    </header>
    
    <main class="popup-content">
      <div class="input-section">
        <textarea 
          v-model="prompt"
          placeholder="请输入图片描述..."
          @keyup.enter="generateImage"
        ></textarea>
        <button 
          class="generate-btn"
          :disabled="isLoading"
          @click="generateImage"
        >
          {{ isLoading ? '生成中...' : '生成图片' }}
        </button>
      </div>
      
      <!-- 添加图片加载效果 -->
      <div class="image-loading" v-if="isImageLoading">
        <div class="spinner"></div>
        <p>正在生成图片，请稍候...</p>
      </div>
      
      <div class="image-section" v-if="generatedImage && !isImageLoading">
        <img :src="generatedImage" alt="生成的图片">
        <div class="button-group">
          <button class="save-btn" @click="saveImage">保存图片</button>
          <button class="copy-btn" @click="copyImage">复制图片</button>
        </div>
      </div>
      
      <div class="notification" v-if="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </main>
    
    <SettingsModal 
      v-if="isSettingsOpen"
      @close="closeSettings"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SettingsModal from './components/SettingsModal.vue';
import { storageService } from '../services/storageService';
import { generateImage as generateImageApi } from '../services/aiService';

const prompt = ref('');
const generatedImage = ref(null);
const isLoading = ref(false);
const isImageLoading = ref(false); // 新增图片加载状态
const isSettingsOpen = ref(false);
const notification = ref(null);
const settings = ref(null);

// 初始化
onMounted(async () => {
  try {
    settings.value = await storageService.getSettings();
  } catch (error) {
    showNotification('加载设置失败: ' + error.message, 'error');
  }
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'NOTIFICATION') {
      showNotification(message.notification.message, message.notification.type);
    }
  });
});

// 打开设置
const openSettings = () => {
  isSettingsOpen.value = true;
};

// 关闭设置
const closeSettings = async () => {
  isSettingsOpen.value = false;
  // 重新加载设置
  settings.value = await storageService.getSettings();
};

// 生成图片
const generateImage = async () => {
  if (!prompt.value.trim()) {
    showNotification('请输入图片描述', 'warning');
    return;
  }
  
  try {
    isLoading.value = true;
    isImageLoading.value = true; // 开始加载图片
    generatedImage.value = null; // 清空之前的图片
    
    const imageUrl = await generateImageApi(prompt.value, settings.value);
    
    // 预加载图片
    const img = new Image();
    img.onload = () => {
      generatedImage.value = imageUrl;
      isImageLoading.value = false; // 图片加载完成
    };
    img.onerror = (error) => {
      throw new Error('图片加载失败');
    };
    img.src = imageUrl;
    
    // 添加到历史记录
    await storageService.addToHistory({
      id: Date.now(),
      prompt: prompt.value,
      imageUrl
    });
    
    showNotification('图片生成成功!', 'success');
  } catch (error) {
    isImageLoading.value = false;
    showNotification('生成图片失败: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 保存图片
const saveImage = async () => {
  if (!generatedImage.value) return;
  
  try {
    // 获取图片数据
    const response = await fetch(generatedImage.value);
    const blob = await response.blob();
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('图片已保存', 'success');
  } catch (error) {
    showNotification('保存图片失败: ' + error.message, 'error');
  }
};

// 复制图片
const copyImage = async () => {
  if (!generatedImage.value) return;
  
  try {
    // 获取图片数据
    const response = await fetch(generatedImage.value);
    const blob = await response.blob();
    
    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    
    showNotification('图片已复制到剪贴板', 'success');
  } catch (error) {
    showNotification('复制图片失败: ' + error.message, 'error');
  }
};

// 显示通知
const showNotification = (message, type = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};
</script>

<style scoped>
.popup-container {
  width: 600px; /* 增加宽度 */
  min-height: 600px; /* 增加高度 */
  padding: 20px; /* 增加内边距 */
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* 增加间距 */
}

.popup-header h1 {
  margin: 0;
  font-size: 1.8rem; /* 增加字体大小 */
  color: #333;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.5rem; /* 增加图标大小 */
  cursor: pointer;
  transition: transform 0.2s;
}

.settings-btn:hover {
  transform: rotate(45deg);
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 增加间距 */
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 增加间距 */
}

textarea {
  width: 100%;
  height: 120px; /* 增加高度 */
  padding: 15px; /* 增加内边距 */
  border: 2px solid #e2e8f0;
  border-radius: 10px; /* 增加圆角 */
  resize: none;
  font-family: inherit;
  font-size: 16px; /* 增加字体大小 */
}

.generate-btn {
  padding: 12px 15px; /* 增加按钮大小 */
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px; /* 增加字体大小 */
  transition: background-color 0.2s;
}

.generate-btn:hover {
  background-color: #4338ca;
}

.generate-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* 图片加载效果 */
.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(79, 70, 229, 0.2);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.image-section img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.save-btn, .copy-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: opacity 0.2s;
}

.save-btn:hover, .copy-btn:hover {
  opacity: 0.9;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.copy-btn {
  background-color: #3b82f6;
  color: white;
}

.notification {
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
  font-size: 15px;
}

.notification.success {
  background-color: #d1fae5;
  color: #065f46;
}

.notification.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.notification.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.notification.info {
  background-color: #e0f2fe;
  color: #0369a1;
}
</style>