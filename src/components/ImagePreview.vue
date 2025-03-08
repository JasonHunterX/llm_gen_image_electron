<template>
  <div class="image-preview-container card">
    <h2 class="preview-title">生成结果</h2>
    <div class="preview-layout">
      <!-- 左侧图片区域 -->
      <ImageViewer 
        :imageUrl="generatedImage" 
        :isLoading="isLoading"
        @image-loaded="handleImageLoad"
      />

      <!-- 右侧控制区域 -->
      <div class="controls-section">
        <!-- 音频播放器 -->
        <div v-if="generatedAudio" class="control-group">
          <h3 class="control-title">音频播放</h3>
          <div class="audio-player-wrapper">
            <AudioVisualizer 
              v-if="audioElement" 
              :audioElement="audioElement" 
              ref="visualizerComponent"
            />
            <audio
              ref="audioElement"
              controls
              class="audio-player"
              :src="generatedAudio"
              @play="startVisualization"
              @pause="stopVisualization"
              @ended="stopVisualization"
              @loadeddata="handleAudioLoad"
              @timeupdate="updateCurrentText"
              crossorigin="anonymous"
            ></audio>
          </div>
        </div>
        
        <!-- 图片操作控制 -->
        <ImageControls :imageUrl="generatedImage" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import ImageViewer from "./ImageViewer.vue";
import ImageControls from "./ImageControls.vue";
import AudioVisualizer from "./AudioVisualizer.vue";

export default {
  name: "ImagePreview",
  components: {
    ImageViewer,
    ImageControls,
    AudioVisualizer
  },
  setup() {
    const store = useStore();
    const isLoading = computed(
      () => store.getters.isImageLoading || store.getters.isLoading
    );

    const handleImageLoad = () => {
      store.commit("setImageLoading", false);
    };

    // 获取生成的图片URL和音频URL
    const generatedImage = computed(() => store.getters.getGeneratedImage);
    const generatedAudio = computed(() => store.getters.getGeneratedAudio);

    // 音频相关
    const audioElement = ref(null);
    const visualizerComponent = ref(null);

    const startVisualization = () => {
      if (visualizerComponent.value) {
        visualizerComponent.value.startVisualization();
      }
    };

    const stopVisualization = () => {
      if (visualizerComponent.value) {
        visualizerComponent.value.stopVisualization();
      }
    };

    const handleAudioLoad = () => {
      console.log("音频已加载");
    };

    // 音频文本相关
    const audioText = computed(() => store.getters.getAudioText || "");
    const audioTextSentences = computed(() => {
      if (!audioText.value) return [];
      return audioText.value.split(/(?<=[。？！.?!])/g).filter((s) => s.trim());
    });

    const currentSentenceIndex = ref(0);

    // 根据音频播放进度更新当前句子
    const updateCurrentText = () => {
      if (!audioElement.value || audioTextSentences.value.length === 0) return;

      const duration = audioElement.value.duration;
      const currentTime = audioElement.value.currentTime;
      const progress = currentTime / duration;

      const newIndex = Math.min(
        Math.floor(progress * audioTextSentences.value.length),
        audioTextSentences.value.length - 1
      );

      if (newIndex !== currentSentenceIndex.value) {
        currentSentenceIndex.value = newIndex;
      }
    };

    // 监听音频文本变化，重置当前句子索引
    watch(audioText, () => {
      currentSentenceIndex.value = 0;
    });

    onMounted(() => {
      console.log("组件已挂载");
    });

    onBeforeUnmount(() => {
      stopVisualization();
    });

    return {
      generatedImage,
      generatedAudio,
      isLoading,
      handleImageLoad,
      audioElement,
      visualizerComponent,
      startVisualization,
      stopVisualization,
      handleAudioLoad,
      updateCurrentText,
      audioText,
      audioTextSentences,
      currentSentenceIndex
    };
  },
};
</script>

<style scoped>
.preview-title {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 1.5rem;
  text-align: center;
}

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

.audio-player-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audio-player {
  width: 100%;
  border-radius: 8px;
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .preview-layout {
    flex-direction: column;
  }
  
  .controls-section {
    min-width: 100%;
  }
}
</style>
