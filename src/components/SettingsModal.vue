<template>
  <div class="settings-modal-overlay" v-if="isOpen" @click="closeModal">
    <div class="settings-modal-content" @click.stop>
      <div class="settings-modal-header">
        <h2><span class="icon">⚙️</span> 设置</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="settings-modal-body">
        <div class="settings-group">
          <h3><span class="icon">🤖</span> 模型服务设置</h3>
          <div class="form-group">
            <label for="modelService">选择模型服务</label>
            <select 
              id="modelService" 
              v-model="selectedService" 
              class="styled-select"
            >
              <option 
                v-for="(service, key) in modelServices" 
                :key="key" 
                :value="key"
              >
                {{ service.name }}
              </option>
            </select>
          </div>
        </div>
      
        <!-- Ollama 设置 -->
        <div class="settings-group" v-if="selectedService === 'ollama'">
          <h3><span class="icon">🚀</span> Ollama API设置</h3>
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
                class="fetch-models-btn"
                :class="{ 'loading': isLoading }" 
                @click="fetchOllamaModels" 
                :disabled="isLoading || !settings.ollama.apiUrl"
              >
                <span class="icon">{{ isLoading ? '🔄' : '📡' }}</span>
                {{ isLoading ? '加载中...' : '获取模型' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="ollamaModel">选择模型</label>
            <select 
              id="ollamaModel" 
              v-model="settings.ollama.modelName" 
              class="styled-select"
            >
              <option value="" disabled>请选择模型</option>
              <option 
                v-for="model in ollamaModels" 
                :key="model.name" 
                :value="model.name"
              >
                {{ model.name }} ({{ formatSize(model.size) }})
              </option>
            </select>
            <p v-if="ollamaModels.length === 0" class="model-hint">
              <span class="icon">💡</span> 请先获取模型列表，或手动输入模型名称
            </p>
          </div>
        </div>
      
        <!-- Deepseek 设置 -->
        <div class="settings-group" v-if="selectedService === 'deepseek'">
          <h3><span class="icon">🎯</span> Deepseek API设置</h3>
          <div class="form-group">
            <label for="deepseekApiKey">API Key</label>
            <div class="api-url-input">
              <input 
                type="password" 
                id="deepseekApiKey" 
                v-model="settings.deepseek.apiKey" 
                placeholder="请输入 Deepseek API Key"
                class="styled-input"
              />
              <button 
                class="fetch-models-btn"
                :class="{ 'loading': isLoading }" 
                @click="verifyDeepseekApiKey" 
                :disabled="isLoading || !settings.deepseek.apiKey"
              >
                <span class="icon">{{ isLoading ? '🔄' : '🔑' }}</span>
                {{ isLoading ? '验证中...' : '验证密钥' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="deepseekModel">选择模型</label>
            <select 
              id="deepseekModel" 
              v-model="settings.deepseek.modelName" 
              class="styled-select"
            >
              <option value="" disabled>请选择模型</option>
              <option 
                v-for="model in modelServices.deepseek.models" 
                :key="model.id" 
                :value="model.id"
              >
                {{ model.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="settings-modal-footer">
        <button class="cancel-btn" @click="closeModal">
          <span class="icon">✖️</span> 取消
        </button>
        <button class="save-btn" @click="saveSettings">
          <span class="icon">💾</span> 保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import OpenAI from 'openai';  // 添加 OpenAI 导入

export default {
  name: 'SettingsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore();
    const isLoading = ref(false);
    const ollamaModels = ref([]);
    const selectedService = ref('ollama'); // 默认选择 ollama
    
    // 在组件挂载时加载设置
    onMounted(() => {
      loadSettings();
    });

    // 定义支持的模型服务
    const modelServices = {
      ollama: {
        name: 'Ollama',
        models: [] // 动态获取
      },
      deepseek: {
        name: 'Deepseek',
        models: [
          { id: 'deepseek-coder', name: 'Deepseek Coder' },
          { id: 'deepseek-vision', name: 'Deepseek Vision' },
          { id: 'deepseek-chat', name: 'Deepseek Chat' }
        ]
      }
    };

    // 更新 Deepseek API 验证函数
    const verifyDeepseekApiKey = async () => {
      if (!settings.deepseek.apiKey) {
        store.dispatch('showNotification', {
          message: '请输入 Deepseek API Key',
          type: 'error'
        });
        return false;
      }

      isLoading.value = true;
      try {
        const openai = new OpenAI({
          baseURL: 'https://api.deepseek.com',
          apiKey: settings.deepseek.apiKey,
          dangerouslyAllowBrowser: true  // 添加此配置以允许浏览器端使用
        });

        // 直接获取模型列表，不需要调用 next()
        const models = await openai.models.list();
        
        // 检查是否成功获取到模型列表
        if (models && models.data && models.data.length > 0) {
          store.dispatch('showNotification', {
            message: 'Deepseek API Key 验证成功',
            type: 'success'
          });
          return true;
        } else {
          throw new Error('未能获取到模型列表');
        }
      } catch (error) {
        console.error('Deepseek API 验证失败:', error);
        store.dispatch('showNotification', {
          message: `验证失败: ${error.message}`,
          type: 'error'
        });
        return false;
      } finally {
        isLoading.value = false;
      }
    };

    // 修改保存设置函数
    const saveSettings = async () => {
      // 如果选择了 Deepseek，先验证 API Key
      if (selectedService.value === 'deepseek') {
        const isValid = await verifyDeepseekApiKey();
        if (!isValid) return;
      }

      const settingsToSave = {
        ...settings,
        selectedService: selectedService.value
      };
      
      localStorage.setItem('aiImageGeneratorSettings', JSON.stringify(settingsToSave));
      store.dispatch('updateSettings', settingsToSave);
      
      store.dispatch('showNotification', {
        message: '设置已保存',
        type: 'success'
      });
      
      closeModal();
    };
    
    // 设置对象 - 添加 deepseek 配置
    const settings = reactive({
      ollama: {
        apiUrl: 'http://localhost:11434',
        modelName: ''
      },
      deepseek: {
        apiKey: '',
        modelName: ''
      }
    });

    // 修改加载设置函数
    const loadSettings = async () => {
      const savedSettings = localStorage.getItem('aiImageGeneratorSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // 合并已保存的设置
        if (parsedSettings.ollama) {
          settings.ollama = { ...settings.ollama, ...parsedSettings.ollama };
        }
        if (parsedSettings.deepseek) {
          settings.deepseek = { ...settings.deepseek, ...parsedSettings.deepseek };
        }
        
        // 设置当前选中的服务
        if (parsedSettings.selectedService) {
          selectedService.value = parsedSettings.selectedService;
        }
        
        // 如果是 ollama 且有配置，获取模型列表
        if (selectedService.value === 'ollama' && settings.ollama.apiUrl) {
          await fetchOllamaModels();
        }
      }
    };

    // 获取Ollama模型列表
    const fetchOllamaModels = async () => {
      if (!settings.ollama.apiUrl) {
        store.dispatch('showNotification', {
          message: '请先输入Ollama API地址',
          type: 'error'
        });
        return;
      }
      
      isLoading.value = true;
      try {
        const response = await fetch(`${settings.ollama.apiUrl}/api/tags`);
        if (!response.ok) {
          throw new Error('无法连接到Ollama服务');
        }
        
        const data = await response.json();
        ollamaModels.value = data.models || [];
        modelServices.ollama.models = ollamaModels.value;
        
        if (ollamaModels.value.length > 0) {
          store.dispatch('showNotification', {
            message: `成功获取到 ${ollamaModels.value.length} 个模型`,
            type: 'success'
          });
          
          // 如果当前没有选择模型，自动选择第一个
          if (!settings.ollama.modelName) {
            settings.ollama.modelName = ollamaModels.value[0].name;
          }
        } else {
          store.dispatch('showNotification', {
            message: '未找到已安装的Ollama模型',
            type: 'warning'
          });
        }
      } catch (error) {
        console.error('获取Ollama模型失败:', error);
        store.dispatch('showNotification', {
          message: `获取模型失败: ${error.message}`,
          type: 'error'
        });
      } finally {
        isLoading.value = false;
      }
    };
    
    // 格式化文件大小
    const formatSize = (bytes) => {
      if (!bytes) return '未知大小';
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    // 关闭模态窗口
    const closeModal = () => {
      emit('close');
    };
    
    return {
      settings,
      isLoading,
      ollamaModels,
      selectedService,
      modelServices,
      fetchOllamaModels,
      verifyDeepseekApiKey,  // 添加这一行
      formatSize,
      saveSettings,
      closeModal
    };
  }
}
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.settings-modal-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.settings-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
}

.settings-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.settings-modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.settings-group {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-group h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #334155;
}

.styled-input, .styled-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: white;
}

.styled-input:focus, .styled-select:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.api-url-input {
  display: flex;
  gap: 0.75rem;
}

.fetch-models-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.fetch-models-btn:not(:disabled):hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.fetch-models-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.fetch-models-btn.loading {
  position: relative;
}

.fetch-models-btn.loading .icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.model-hint {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f8fafc;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.save-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.icon {
  font-size: 1.1em;
}

@media (max-width: 640px) {
  .settings-modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .api-url-input {
    flex-direction: column;
  }
  
  .fetch-models-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>