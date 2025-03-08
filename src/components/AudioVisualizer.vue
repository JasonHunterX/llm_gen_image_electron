<template>
  <div class="audio-visualizer-container">
    <canvas ref="visualizer" class="audio-visualizer"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'AudioVisualizer',
  props: {
    audioElement: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const visualizer = ref(null);
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;

    const startVisualization = () => {
      try {
        if (!props.audioElement || !visualizer.value) return;

        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaElementSource(props.audioElement);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
        }

        const canvas = visualizer.value;
        const ctx = canvas.getContext('2d');

        if (canvas.width === 0 || canvas.offsetWidth !== canvas.width) {
          canvas.width = canvas.offsetWidth || 300;
        }
        if (canvas.height === 0) {
          canvas.height = 100;
        }

        if (animationId) {
          cancelAnimationFrame(animationId);
        }

        const draw = () => {
          animationId = requestAnimationFrame(draw);
          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;

          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, WIDTH, HEIGHT);
          ctx.fillStyle = 'rgb(245, 245, 245)';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          const barWidth = Math.max(2, (WIDTH / dataArray.length) * 2);
          let x = 0;

          for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i] / 2;
            const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);

            if (barHeight < 20) {
              gradient.addColorStop(0, '#93c5fd');
              gradient.addColorStop(1, '#3b82f6');
            } else if (barHeight < 40) {
              gradient.addColorStop(0, '#c4b5fd');
              gradient.addColorStop(1, '#8b5cf6');
            } else {
              gradient.addColorStop(0, '#fbcfe8');
              gradient.addColorStop(1, '#ec4899');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };

        draw();
      } catch (error) {
        console.error('可视化过程中出错:', error);
      }
    };

    const stopVisualization = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleResize = () => {
      if (visualizer.value) {
        visualizer.value.width = visualizer.value.offsetWidth;
      }
    };

    onMounted(() => {
      setTimeout(() => {
        if (visualizer.value) {
          visualizer.value.width = visualizer.value.offsetWidth;
          visualizer.value.height = 100;
        }
      }, 100);

      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      stopVisualization();
      window.removeEventListener('resize', handleResize);
      
      if (audioContext && audioContext.state !== 'closed') {
        audioContext
          .close()
          .catch((err) => console.error('关闭音频上下文时出错:', err));
      }
    });

    return {
      visualizer,
      startVisualization,
      stopVisualization
    };
  }
};
</script>

<style scoped>
.audio-visualizer-container {
  width: 100%;
}

.audio-visualizer {
  width: 100%;
  height: 100px;
  background: rgb(245, 245, 245);
  border-radius: 8px;
  margin-bottom: 8px;
}
</style>