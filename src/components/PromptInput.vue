<template>
  <div class="prompt-input-container">
    <div class="input-group">
      <textarea
        v-model="promptText"
        placeholder="描述你想要生成的图片，例如：'一只在宇宙中漂浮的猫，背景是星云'"
        rows="3"
        @keydown.ctrl.enter="handleGenerate"
      ></textarea>
      <div class="prompt-tips">
        <p>提示：尝试详细描述你想要的场景、风格、颜色等</p>
        <p class="shortcut">按 Ctrl+Enter 快速生成</p>
      </div>
      
      <!-- 添加生成按钮 -->
      <button 
        @click="handleGenerate" 
        :disabled="isLoading || !hasPrompt" 
        class="generate-btn"
      >
        <span v-if="isLoading">
          <span class="loading-spinner"></span>
          生成中...
        </span>
        <span v-else>生成图片</span>
      </button>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'PromptInput',
  setup() {
    const store = useStore();
    const promptText = ref('');
    
    // 从store获取当前prompt
    const storePrompt = computed(() => store.getters.getPrompt);
    
    // 获取加载状态和错误信息
    const isLoading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);
    const hasPrompt = computed(() => promptText.value.trim().length > 0);
    
    // 当store中的prompt变化时，更新本地的promptText
    watch(storePrompt, (newValue) => {
      if (newValue !== promptText.value) {
        promptText.value = newValue;
      }
    });
    
    // 当本地的promptText变化时，更新store
    watch(promptText, (newValue) => {
      store.dispatch('updatePrompt', newValue);
    });
    
    const handleGenerate = () => {
      if (promptText.value.trim() && !isLoading.value) {
        store.dispatch('generateImageFromPrompt');
      }
    };
    
    return {
      promptText,
      isLoading,
      error,
      hasPrompt,
      handleGenerate
    };
  }
}
</script>

<style scoped>
.prompt-input-container {
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: border-color 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.prompt-tips {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0 0.5rem;
}

.shortcut {
  font-style: italic;
  margin-top: 0.25rem;
}

/* 生成按钮样式 */
.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  align-self: center;
  margin-top: 0.5rem;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}

.generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #a5a6f6 0%, #9d97f5 100%);
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  background-color: #fee2e2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}
</style>