<template>
  <div class="settings-modal-overlay" @click="closeModal">
    <div class="settings-modal-content" @click.stop>
      <div class="settings-modal-header">
        <h2><span class="icon">⚙️</span> 设置</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="settings-modal-body">
        <div class="settings-group">
          <h3><span class="icon">🤖</span> Ollama API设置</h3>
          <div class="form-group">
            <label for="ollamaUrl">API 地址</label>
            <div class="api-url-input">
              <input 
                type="text" 
                id="ollamaUrl" 
                v-model="settings.ollama.apiUrl" 
                placeholder="例如: http://localhost:11434"
                class="styled-input"
              />
              <button 
                class="test-btn"
                :class="{ 'loading': isLoading }" 
                @click="testConnection" 
                :disabled="isLoading || !settings.ollama.apiUrl"
              >
                <span class="icon">{{ isLoading ? '🔄' : '📡' }}</span>
                {{ isLoading ? '测试中...' : '测试连接' }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="ollamaModel">模型名称</label>
            <input 
              type="text" 
              id="ollamaModel" 
              v-model="settings.ollama.modelName" 
              placeholder="例如: kevin_qwen:latest"
              class="styled-input"
            />
          </div>
        </div>

        <div class="settings-group">
          <h3><span class="icon">🎨</span> 图片参数设置</h3>
          <div class="form-group">
            <label>图片尺寸</label>
            <div class="size-inputs">
              <input 
                type="number" 
                v-model="settings.imageParams.width" 
                placeholder="宽度"
                class="styled-input"
              />
              <span>×</span>
              <input 
                type="number" 
                v-model="settings.imageParams.height" 
                placeholder="高度"
                class="styled-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>其他选项</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.imageParams.nologo"
                /> 
                隐藏水印
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.imageParams.enhance"
                /> 
                增强效果
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-modal-footer">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="save-btn" @click="saveSettings">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { storageService } from '../../services/storageService';

const emit = defineEmits(['close']);
const isLoading = ref(false);
const settings = reactive({
  ollama: {
    apiUrl: '',
    modelName: ''
  },
  imageParams: {
    width: 1024,
    height: 1024,
    seed: 100,
    model: 'flux',
    nologo: true,
    enhance: false
  }
});

// 初始化加载设置
onMounted(async () => {
  const savedSettings = await storageService.getSettings();
  Object.assign(settings, savedSettings);
});

// 测试API连接
const testConnection = async () => {
  if (!settings.ollama.apiUrl) return;
  
  isLoading.value = true;
  try {
    const response = await fetch(`${settings.ollama.apiUrl}/api/tags`);
    if (!response.ok) throw new Error('连接失败');
    
    const data = await response.json();
    if (data.models?.length > 0) {
      showNotification('连接成功！', 'success');
    } else {
      showNotification('连接成功，但未找到可用模型', 'warning');
    }
  } catch (error) {
    showNotification(`连接失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    await storageService.saveSettings(settings);
    showNotification('设置已保存', 'success');
    closeModal();
  } catch (error) {
    showNotification(`保存失败: ${error.message}`, 'error');
  }
};

// 关闭模态窗口
const closeModal = () => {
  emit('close');
};

// 显示通知
const showNotification = (message, type) => {
  chrome.runtime.sendMessage({
    type: 'SHOW_NOTIFICATION',
    notification: { message, type }
  });
};
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.settings-modal-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-modal-body {
  padding: 16px;
}

.settings-group {
  margin-bottom: 24px;
}

.settings-group h3 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.styled-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.api-url-input {
  display: flex;
  gap: 8px;
}

.test-btn {
  white-space: nowrap;
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.test-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-modal-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.save-btn {
  background: #4f46e5;
  color: white;
  border: none;
}

.icon {
  font-size: 1.2em;
}
</style>