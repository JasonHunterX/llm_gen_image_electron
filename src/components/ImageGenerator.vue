<template>
  <div class="image-generator-container">
    <button 
      @click="generateImage" 
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
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ImageGenerator',
  setup() {
    const store = useStore();
    
    const isLoading = computed(() => store.getters.isLoading);
    const error = computed(() => store.getters.getError);
    const prompt = computed(() => store.getters.getPrompt);
    const hasPrompt = computed(() => prompt.value.trim().length > 0);
    
    const generateImage = () => {
      if (hasPrompt.value && !isLoading.value) {
        store.dispatch('generateImageFromPrompt');
      }
    };
    
    return {
      isLoading,
      error,
      hasPrompt,
      generateImage
    };
  }
}
</script>

<style scoped>
.image-generator-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #7ab55c 0%, #68a14a 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(122, 181, 92, 0.2);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(122, 181, 92, 0.3);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #a8d5a8 0%, #95c595 100%);
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
  max-width: 400px;
  text-align: center;
}
</style>