<template>
  <div class="loading-spinner">
    <div class="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: '正在加载...',
    },
  },
};
</script>

<style scoped>
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
</style>