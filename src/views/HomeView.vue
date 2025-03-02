<template>
  <div class="home-container">
    <div class="prompt-section card">
      <h2>创建你的AI艺术</h2>
      <PromptInput />
    </div>
    
    <div class="result-section">
      <!-- 移除 ImageGenerator 组件 -->
      <ImagePreview v-if="generatedImage" />
    </div>
    
    <div class="history-section card" v-if="history.length > 0">
      <h2>历史记录</h2>
      <div class="history-grid">
        <div v-for="item in history" :key="item.id" class="history-item">
          <img :src="item.imageUrl" alt="生成的图片" @click="viewImage(item)" />
          <p>{{ item.prompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import PromptInput from '../components/PromptInput.vue';
// 移除 ImageGenerator 导入
import ImagePreview from '../components/ImagePreview.vue';

export default {
  name: 'HomeView',
  components: {
    PromptInput,
    // 移除 ImageGenerator
    ImagePreview
  },
  setup() {
    const store = useStore();
    
    const generatedImage = computed(() => store.getters.getGeneratedImage);
    const history = computed(() => store.getters.getHistory);
    
    const viewImage = (item) => {
      store.commit('setPrompt', item.prompt);
      store.commit('setGeneratedImage', item.imageUrl);
    };
    
    return {
      generatedImage,
      history,
      viewImage
    };
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.prompt-section {
  width: 100%;
}

.prompt-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.history-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.history-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.history-item:hover {
  transform: scale(1.05);
}

.history-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.history-item p {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .result-section {
    flex-direction: row;
    justify-content: center;
  }
}
</style>