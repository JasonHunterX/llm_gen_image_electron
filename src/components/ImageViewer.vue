<template>
  <div class="image-section">
    <div
      class="image-wrapper"
      :class="{ loading: isLoading }"
      :style="{ maxWidth: `${imageSize}%` }"
    >
      <loading-spinner v-if="isLoading" message="正在生成精美图片..."/>
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="AI生成的图片"
        @load="handleImageLoad"
        :class="{ 'fade-in': !isLoading }"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineEmits } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  name: 'ImageViewer',
  components: {
    LoadingSpinner
  },
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['image-loaded'],
  setup(props, { emit }) {
    const imageSize = ref(80); // 默认图片尺寸为80%

    const resetSize = () => {
      imageSize.value = 80;
    };

    const handleImageLoad = () => {
      emit('image-loaded');
    };

    return {
      imageSize,
      resetSize,
      handleImageLoad
    };
  }
};
</script>

<style scoped>
.image-section {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.image-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: max-width 0.3s ease;
  margin: 0 auto;
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
</style>