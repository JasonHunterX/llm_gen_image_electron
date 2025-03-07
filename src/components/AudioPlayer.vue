<template>
  <div class="audio-player-container card">
    <h2>音频预览</h2>
    <div class="audio-content">
      <div v-if="isLoading" class="loading-message">
        正在生成音频...
      </div>
      <audio 
        v-if="audioUrl" 
        controls 
        :src="audioUrl"
        class="audio-player"
      >
        您的浏览器不支持音频播放
      </audio>
      <button 
        @click="generateAudio" 
        :disabled="isLoading || !hasPrompt" 
        class="generate-btn"
      >
        {{ isLoading ? '生成中...' : '生成音频' }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AudioPlayer',
  setup() {
    const store = useStore();
    
    const audioUrl = computed(() => store.getters.getGeneratedAudio);
    const isLoading = computed(() => store.getters.isAudioLoading);
    const hasPrompt = computed(() => store.getters.getPrompt.trim().length > 0);
    
    const generateAudio = () => {
      if (hasPrompt.value && !isLoading.value) {
        store.dispatch('generateAudioFromPrompt');
      }
    };
    
    return {
      audioUrl,
      isLoading,
      hasPrompt,
      generateAudio,
    };
  }
}
</script>

<style scoped>
.audio-player-container {
  margin-top: 2rem;
  padding: 1.5rem;
}

.audio-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.audio-player {
  width: 100%;
  margin: 1rem 0;
}

.generate-btn {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  cursor: pointer;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-message {
  color: #666;
  font-style: italic;
}
</style>