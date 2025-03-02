<template>
  <div class="home-container">
    <div class="prompt-section card">
      <h2>创建你的AI艺术</h2>
      <PromptInput />
    </div>
    
    <div class="result-section">
      <ImagePreview v-if="generatedImage" />
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
  height: calc(100vh - 60px); /* 假设顶部导航栏高度为60px，请根据实际情况调整 */
  margin: 0 auto;
  display: flex;
  flex-direction: row; /* 改为水平布局 */
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem;
}

.prompt-section {
  width: 40%;
  overflow-y: auto; /* 添加垂直滚动 */
  padding: 1.5rem;
}

.result-section {
  width: 60%;
  overflow-y: auto; /* 添加垂直滚动 */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  /* padding: 1.5rem; */
}

/* 自定义滚动条样式 */
.prompt-section::-webkit-scrollbar,
.result-section::-webkit-scrollbar {
  width: 6px;
}

.prompt-section::-webkit-scrollbar-thumb,
.result-section::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 3px;
}

.prompt-section::-webkit-scrollbar-track,
.result-section::-webkit-scrollbar-track {
  background-color: #f1f1f1;
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