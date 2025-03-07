<template>
  <div class="image-preview-container card">
    <h2 class="preview-title">生成结果</h2>
    <div class="preview-layout">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <div
          class="image-wrapper"
          :class="{ loading: isLoading }"
          :style="{ maxWidth: `${imageSize}%` }"
        >
          <div v-if="isLoading" class="loading-spinner">
            <div class="spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>正在生成精美图片...</p>
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
        <!-- <div class="control-group">
          <h3 class="control-title">图片尺寸调整</h3>
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
        </div> -->

        <!-- 添加音频播放器 -->
        <!-- 在音频播放器部分添加波形图 -->
        <!-- 在音频播放器部分添加文本内容显示 -->
        <div v-if="generatedAudio" class="control-group">
          <h3 class="control-title">音频播放</h3>
          <div class="audio-player-wrapper">
            <canvas ref="visualizer" class="audio-visualizer"></canvas>
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

            <!-- 添加音频内容显示区域 -->
            <!-- <div class="audio-text-container">
              <div class="audio-text-scroll" ref="textScroller">
                <p
                  v-for="(sentence, index) in audioTextSentences"
                  :key="index"
                  :class="{
                    'current-sentence': currentSentenceIndex === index,
                  }"
                  ref="sentences"
                >
                  {{ sentence }}
                </p>
              </div>
            </div> -->
          </div>
        </div>
        <!-- <div class="control-group">
          <h3 class="control-title">音频操作</h3>
          <div class="actions">
            <button
              @click="generateAudio"
              class="save-btn"
              style="background-color: #8b5cf6"
            >
              <span class="icon">🔊</span> 生成音频
            </button>
          </div>
        </div> -->
        <!-- 操作按钮 -->
        <div class="control-group">
          <h3 class="control-title">图片操作</h3>
          <div class="actions">
            <button @click="saveImageToLocal" class="save-btn">
              <span class="icon">💾</span> 保存到本地
            </button>
            <!-- 添加图片链接展示和复制功能 -->
            <div class="image-url-section">
              <div class="url-display">
                <span class="url-text" :title="generatedImage">{{
                  generatedImage
                }}</span>
                <button @click="copyImageUrl" class="copy-url-btn">
                  <span class="icon">📋</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知区域 -->
        <div
          v-if="notification"
          class="notification"
          :class="notification.type"
        >
          {{ notification.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import { saveImageToLocal } from "@/services/aiService";

export default {
  name: "ImagePreview",
  setup() {
    const store = useStore();
    const notification = ref(null);
    const isLoading = computed(
      () => store.getters.isImageLoading || store.getters.isLoading
    );
    const imageSize = ref(80); // 默认图片尺寸为80%

    const resetSize = () => {
      imageSize.value = 80;
    };

    const handleImageLoad = () => {
      store.commit("setImageLoading", false);
    };

    // 获取生成的图片URL
    const generatedImage = computed(() => store.getters.getGeneratedImage);
    const generatedAudio = computed(() => store.getters.getGeneratedAudio);

    // 添加保存图片到本地的方法
    const saveImageToLocalHandler = async () => {
      if (!generatedImage.value) {
        notification.value = {
          message: "没有可保存的图片",
          type: "error",
        };
        setTimeout(() => {
          notification.value = null;
        }, 3000);
        return;
      }

      try {
        await saveImageToLocal(
          generatedImage.value,
          `trae-image-${Date.now()}.png`
        );
        notification.value = {
          message: "图片已保存到本地",
          type: "success",
        };
        setTimeout(() => {
          notification.value = null;
        }, 3000);
      } catch (error) {
        console.error("保存图片失败:", error);
        notification.value = {
          message: `保存失败: ${error.message}`,
          type: "error",
        };
        setTimeout(() => {
          notification.value = null;
        }, 3000);
      }
    };

    // 添加复制图片URL的方法
    const copyImageUrl = () => {
      if (!generatedImage.value) {
        notification.value = {
          message: "没有可复制的图片链接",
          type: "error",
        };
        setTimeout(() => {
          notification.value = null;
        }, 3000);
        return;
      }

      navigator.clipboard
        .writeText(generatedImage.value)
        .then(() => {
          notification.value = {
            message: "图片链接已复制到剪贴板",
            type: "success",
          };
          setTimeout(() => {
            notification.value = null;
          }, 3000);
        })
        .catch((err) => {
          notification.value = {
            message: `复制失败: ${err.message}`,
            type: "error",
          };
          setTimeout(() => {
            notification.value = null;
          }, 3000);
        });
    };

    const audioElement = ref(null);
    const visualizer = ref(null);
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;

    const startVisualization = () => {
      console.log("开始可视化");

      try {
        if (!audioElement.value) {
          console.error("音频元素不存在");
          return;
        }

        if (!visualizer.value) {
          console.error("可视化器元素不存在");
          return;
        }

        if (!audioContext) {
          console.log("创建音频上下文");
          audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const source = audioContext.createMediaElementSource(
            audioElement.value
          );
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          // 修改连接方式，确保音频能正常播放
          source.connect(analyser);
          analyser.connect(audioContext.destination);

          dataArray = new Uint8Array(analyser.frequencyBinCount);
        }

        const canvas = visualizer.value;
        const ctx = canvas.getContext("2d");

        // 确保 canvas 尺寸已设置
        if (canvas.width === 0 || canvas.offsetWidth !== canvas.width) {
          canvas.width = canvas.offsetWidth || 300; // 提供一个默认宽度
        }
        if (canvas.height === 0) {
          canvas.height = 100;
        }

        console.log("Canvas 尺寸:", canvas.width, "x", canvas.height);

        // 清除之前的动画
        if (animationId) {
          cancelAnimationFrame(animationId);
        }

        const draw = () => {
          animationId = requestAnimationFrame(draw);

          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;

          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, WIDTH, HEIGHT);
          ctx.fillStyle = "rgb(245, 245, 245)";
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          const barWidth = Math.max(2, (WIDTH / dataArray.length) * 2);
          let barHeight;
          let x = 0;

          for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;

            // 创建渐变色，根据音量高低设置不同的颜色
            const gradient = ctx.createLinearGradient(
              0,
              HEIGHT,
              0,
              HEIGHT - barHeight
            );

            if (barHeight < 20) {
              // 低音量 - 蓝色渐变
              gradient.addColorStop(0, "#93c5fd");
              gradient.addColorStop(1, "#3b82f6");
            } else if (barHeight < 40) {
              // 中音量 - 紫色渐变
              gradient.addColorStop(0, "#c4b5fd");
              gradient.addColorStop(1, "#8b5cf6");
            } else {
              // 高音量 - 粉色渐变
              gradient.addColorStop(0, "#fbcfe8");
              gradient.addColorStop(1, "#ec4899");
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }
        };

        draw();
      } catch (error) {
        console.error("可视化过程中出错:", error);
      }
    };

    const stopVisualization = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    onMounted(() => {
      // 使用 nextTick 确保 DOM 已经渲染
      setTimeout(() => {
        if (visualizer.value) {
          console.log("设置 canvas 尺寸");
          visualizer.value.width = visualizer.value.offsetWidth;
          visualizer.value.height = 100;
        }
        // 添加这些日志来调试
        console.log("音频URL:", generatedAudio.value);
        console.log("音频文本:", audioText.value);
        console.log("音频文本句子:", audioTextSentences.value);
      }, 100);
    });

    // 添加一个方法来检查音频元素和可视化器是否正确加载
    const checkAudioVisualizer = () => {
      console.log("Audio Element:", audioElement.value);
      console.log("Visualizer:", visualizer.value);
      console.log("Generated Audio:", generatedAudio.value);
    };

    onBeforeUnmount(() => {
      stopVisualization();
      if (audioContext) {
        // 在某些浏览器中，关闭 audioContext 可能会导致问题
        // 所以我们先检查它的状态
        if (audioContext.state !== "closed") {
          audioContext
            .close()
            .catch((err) => console.error("关闭音频上下文时出错:", err));
        }
      }
    });

    // 在音频加载完成时初始化可视化器
    const handleAudioLoad = () => {
      console.log("音频已加载");
      if (visualizer.value) {
        // 确保 canvas 尺寸正确设置
        const containerWidth = visualizer.value.parentElement.clientWidth;
        visualizer.value.width = containerWidth;
        visualizer.value.height = 100;
        console.log("设置 Canvas 尺寸:", containerWidth, "x", 100);
      }
    };
    // 添加音频文本相关的变量和方法
    const audioText = computed(() => store.getters.getAudioText || "");
    const audioTextSentences = computed(() => {
      if (!audioText.value) return [];
      // 将文本按句号、问号、感叹号分割成句子
      return audioText.value.split(/(?<=[。？！.?!])/g).filter((s) => s.trim());
    });

    const currentSentenceIndex = ref(0);
    const sentences = ref([]);
    const textScroller = ref(null);

    // 根据音频播放进度更新当前句子
    const updateCurrentText = () => {
      if (!audioElement.value || audioTextSentences.value.length === 0) return;

      const duration = audioElement.value.duration;
      const currentTime = audioElement.value.currentTime;
      const progress = currentTime / duration;

      // 根据播放进度计算当前应该显示的句子索引
      const newIndex = Math.min(
        Math.floor(progress * audioTextSentences.value.length),
        audioTextSentences.value.length - 1
      );

      if (newIndex !== currentSentenceIndex.value) {
        currentSentenceIndex.value = newIndex;

        // 滚动到当前句子位置
        if (sentences.value[newIndex] && textScroller.value) {
          const sentenceEl = sentences.value[newIndex];
          textScroller.value.scrollTop =
            sentenceEl.offsetTop -
            textScroller.value.offsetHeight / 2 +
            sentenceEl.offsetHeight / 2;
        }
      }
    };

    // 监听音频文本变化，重置当前句子索引
    watch(audioText, () => {
      currentSentenceIndex.value = 0;
      if (textScroller.value) {
        textScroller.value.scrollTop = 0;
      }
    })
   const generateAudio = () => {
      if (store.getters.getPrompt) {
        console.log("开始生成音频，提示词:", store.getters.getPrompt);
        store.dispatch("generateAudioFromPrompt");
      } else {
        notification.value = {
          message: "请先输入提示词",
          type: "error",
        };
        setTimeout(() => {
          notification.value = null;
        }, 3000);
      }
    };

    return {
      generateAudio,
      audioText,
      audioTextSentences,
      currentSentenceIndex,
      sentences,
      textScroller,
      updateCurrentText,
      generatedImage,
      generatedAudio,
      isLoading,
      imageSize,
      notification,
      resetSize,
      handleImageLoad,
      saveImageToLocal: saveImageToLocalHandler,
      copyImageUrl,
      audioElement,
      visualizer,
      startVisualization,
      stopVisualization,
      handleAudioLoad,
      checkAudioVisualizer,
    };
  },
};
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.save-btn,
.copy-btn {
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }

  .save-btn,
  .copy-btn {
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

.audio-visualizer {
  width: 100%;
  height: 100px;
  background: rgb(245, 245, 245);
  border-radius: 8px;
  margin-bottom: 8px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.save-btn,
.copy-btn {
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }

  .save-btn,
  .copy-btn {
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

.audio-visualizer {
  width: 100%;
  height: 100px;
  background: rgb(245, 245, 245);
  border-radius: 8px;
  margin-bottom: 8px;
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
.audio-text-container {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  height: 150px;
  overflow: hidden;
}

.audio-text-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

.audio-text-scroll p {
  margin: 8px 0;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
}

.audio-text-scroll p.current-sentence {
  background-color: #e0e7ff;
  color: #4338ca;
  font-weight: 500;
}

/* 自定义滚动条样式 */
.audio-text-scroll::-webkit-scrollbar {
  width: 6px;
}

.audio-text-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.audio-text-scroll::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 3px;
}

.audio-text-scroll::-webkit-scrollbar-thumb:hover {
  background: #a5b4fc;
}
</style>
