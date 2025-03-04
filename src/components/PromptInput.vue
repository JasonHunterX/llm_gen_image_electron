<template>
  <div class="prompt-input-container">
    <!-- 添加春耕节艺术字标题 -->
    <div class="spring-festival-title">
      <h1 class="artistic-text">春耕节</h1>
      <div class="subtitle">AI创意画卷</div>
    </div>
    
    <div class="input-group">
      <textarea
        v-model="promptText"
        placeholder="描述你想要创作的春耕场景，例如：'春日田野，农民正在播种耕作，远处是朝阳和嫩绿的新芽'"
        rows="3"
        @keydown.ctrl.enter="handleGenerate"
      ></textarea>
      <div class="prompt-tips">
        <p>提示：尝试描述春耕时节的农事活动、新芽、春雨、播种等春天元素</p>
        <p class="shortcut">按 Ctrl+Enter 快速生成</p>
      </div>
      
      <!-- 添加图片参数设置组件 -->
      <ImageParamsSettings class="params-section" />
      
      <!-- 生成按钮 -->
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
import ImageParamsSettings from './ImageParamsSettings.vue';

export default {
  name: 'PromptInput',
  components: {
    ImageParamsSettings
  },
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

/* 春耕节艺术字标题样式 */
.spring-festival-title {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.artistic-text {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2c5a1e;
  text-shadow: 3px 3px 0 #a8d5a8, 
               5px 5px 0 rgba(0,0,0,0.1);
  letter-spacing: 0.1em;
  margin: 0;
  padding: 0.5rem 0;
  position: relative;
  font-family: "STKaiti", "楷体", "KaiTi", serif;
  background: linear-gradient(to bottom, #4a8c2e 0%, #2c5a1e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: perspective(500px) rotateX(10deg);
}

.artistic-text::before, .artistic-text::after {
  content: "春耕节";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
  padding: 0.5rem 0;
}

.artistic-text::before {
  color: rgba(168, 213, 168, 0.3);
  transform: translateY(3px);
}

.artistic-text::after {
  color: rgba(122, 181, 92, 0.2);
  transform: translateY(6px) scale(1.01);
}

.subtitle {
  font-size: 1.2rem;
  color: #68a14a;
  margin-top: 0.5rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
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
  border: 1px solid #a8d5a8;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: border-color 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #7ab55c;
  box-shadow: 0 0 0 3px rgba(122, 181, 92, 0.2);
}

/* 其他样式保持不变，但更新颜色为春耕主题 */
.generate-btn {
  background: linear-gradient(135deg, #7ab55c 0%, #4a8c2e 100%);
}

.generate-btn:hover:not(:disabled) {
  box-shadow: 0 10px 15px -3px rgba(122, 181, 92, 0.3);
}

.generate-btn:disabled {
  background: linear-gradient(135deg, #a8d5a8 0%, #95c595 100%);
}

/* 其余样式保持不变 */
</style>