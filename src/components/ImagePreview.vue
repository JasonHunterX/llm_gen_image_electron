<template>
  <div class="image-preview-container card">
    <h2 class="preview-title">生成结果</h2>
    <div class="preview-layout">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <div class="image-wrapper" :class="{ loading: isLoading }" :style="{ maxWidth: `${imageSize}%` }">
          <div v-if="isLoading" class="loading-spinner">
            <div class="spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>正在塑造...</p>
          </div>
          <img 
            v-if="generatedImage" 
            :src="generatedImage" 
            alt="AI生成的图片"
            @load="handleImageLoad"
            :class="{ 'fade-in': !isLoading }"
          />
        </div>
      </div>
      
      <!-- 右侧控制区域 -->
      <div class="controls-section">
        <!-- 尺寸控制器 -->
        <div class="control-group">
          <h3 class="control-title">尺寸调整</h3>
          <div class="size-controller">
            <div class="size-label">尺寸: {{ imageSize }}%</div>
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="5" 
              v-model="imageSize" 
              class="size-slider"
            />
            <button @click="resetSize" class="reset-btn">重置</button>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="control-group">
          <h3 class="control-title">操作</h3>
          <div class="actions">
            <button @click="saveImageToLocal" class="save-btn">
              <span class="icon">💾</span> 保存到本地
            </button>
            <!-- 添加图片链接展示和复制功能 -->
            <div class="image-url-section">
              <div class="url-display">
                <span class="url-text" :title="generatedImage">{{ generatedImage }}</span>
                <button @click="copyImageUrl" class="copy-url-btn">
                  <span class="icon">📋</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 通知区域 -->
        <div v-if="notification" class="notification" :class="notification.type">
          {{ notification.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ImagePreview',
  setup() {
    const store = useStore();
    const notification = ref(null);
    const isLoading = computed(() => store.getters.isImageLoading || store.getters.isLoading);
    const imageSize = ref(80); // 默认图片尺寸为80%
    
    const resetSize = () => {
      imageSize.value = 80;
    };
    
    const handleImageLoad = () => {
      store.commit('setImageLoading', false);
    };
    
    // 获取生成的图片URL
    const generatedImage = computed(() => store.getters.getGeneratedImage);
    
    // 保存图片到本地
    const saveImageToLocal = async () => {
      if (!generatedImage.value) return;
      
      try {
        const result = await window.electronAPI.saveImage(generatedImage.value);
        if (result.success) {
          showNotification('图片已成功保存到: ' + result.filePath, 'success');
        } else {
          showNotification(result.message || '保存失败', 'error');
        }
      } catch (error) {
        showNotification('保存图片时出错: ' + error.message, 'error');
      }
    };
    
    // 复制图片URL到剪贴板
    const copyImageUrl = () => {
      if (!generatedImage.value) return;
      
      navigator.clipboard.writeText(generatedImage.value)
        .then(() => {
          showNotification('图片链接已复制到剪贴板', 'success');
        })
        .catch(err => {
          showNotification('复制失败: ' + err.message, 'error');
        });
    };
    
    // 显示通知
    const showNotification = (message, type = 'success') => {
      notification.value = { message, type };
      setTimeout(() => {
        notification.value = null;
      }, 3000);
    };
    
    return {
      generatedImage,
      isLoading,
      imageSize,
      notification,
      resetSize,
      handleImageLoad,
      saveImageToLocal,
      copyImageUrl
    };
  }
}
</script>


<style scoped>
/* 添加标题样式 */
.preview-title {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 其他样式保持不变 */
.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.preview-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.image-section {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.controls-section {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.control-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* 尺寸控制器样式 */
.size-controller {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.size-label {
  font-size: 0.9rem;
  color: #4b5563;
}

.size-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-slider::-webkit-slider-thumb:hover {
  background: #4338ca;
  transform: scale(1.1);
}

.reset-btn {
  align-self: flex-end;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.reset-btn:hover {
  background-color: #e5e7eb;
}

.image-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: max-width 0.3s ease;
  margin: 0 auto;
}

.loading-spinner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner p {
  color: #6366f1;
  font-size: 0.9rem;
  font-weight: 500;
}

.spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 6px solid #6366f1;
  border-radius: 50%;
  animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #6366f1 transparent transparent transparent;
}

.spinner div:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner div:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

img {
  max-width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

img.fade-in {
  opacity: 1;
}

.loading img {
  opacity: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.save-btn, .copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.save-btn:hover {
  background-color: #059669;
}

.copy-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.copy-btn:hover {
  background-color: #e5e7eb;
}

.icon {
  font-size: 1.2rem;
}

.notification {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

.notification.success {
  background-color: #d1fae5;
  color: #065f46;
}

.notification.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }
  
  .save-btn, .copy-btn {
    width: 100%;
  }
  
  .size-controller {
    flex-direction: column;
    align-items: stretch;
  }
  
  .size-label {
    text-align: center;
    margin-bottom: 0.5rem;
  }
}
/* 图片链接展示区域样式 */
.image-url-section {
  margin-top: 1rem;
  background-color: #f8fafc;
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
}

.url-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.url-text {
  flex: 1;
  font-size: 0.85rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  padding: 0.25rem 0;
}

.copy-url-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s ease;
}

.copy-url-btn:hover {
  color: #0f172a;
}

/* 确保通知样式在移动设备上正确显示 */
@media (max-width: 480px) {
  .url-display {
    flex-direction: column;
    align-items: stretch;
  }
  
  .copy-url-btn {
    align-self: flex-end;
  }
}
</style>