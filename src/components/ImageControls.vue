<template>
  <div class="control-group">
    <h3 class="control-title">图片操作</h3>
    <div class="actions">
      <button @click="saveImageToLocal" class="save-btn">
        <span class="icon">💾</span> 保存到本地
      </button>
      <!-- 图片链接展示和复制功能 -->
      <div class="image-url-section">
        <div class="url-display">
          <span class="url-text" :title="imageUrl">{{ imageUrl }}</span>
          <button @click="copyImageUrl" class="copy-url-btn">
            <span class="icon">📋</span>
          </button>
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
</template>

<script>
import { ref } from 'vue';
import { saveImageToLocal } from '@/services/aiService';

export default {
  name: 'ImageControls',
  props: {
    imageUrl: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const notification = ref(null);

    // 保存图片到本地的方法
    const saveImageToLocal = async () => {
      if (!props.imageUrl) {
        showNotification("没有可保存的图片", "error");
        return;
      }

      try {
        await saveImageToLocal(
          props.imageUrl,
          `trae-image-${Date.now()}.png`
        );
        showNotification("图片已保存到本地", "success");
      } catch (error) {
        console.error("保存图片失败:", error);
        showNotification(`保存失败: ${error.message}`, "error");
      }
    };

    // 复制图片URL的方法
    const copyImageUrl = () => {
      if (!props.imageUrl) {
        showNotification("没有可复制的图片链接", "error");
        return;
      }

      navigator.clipboard
        .writeText(props.imageUrl)
        .then(() => {
          showNotification("图片链接已复制到剪贴板", "success");
        })
        .catch((err) => {
          showNotification(`复制失败: ${err.message}`, "error");
        });
    };

    // 显示通知的辅助方法
    const showNotification = (message, type) => {
      notification.value = { message, type };
      setTimeout(() => {
        notification.value = null;
      }, 3000);
    };

    return {
      notification,
      saveImageToLocal,
      copyImageUrl
    };
  }
};
</script>

<style scoped>
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

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
  background-color: #10b981;
  color: white;
}

.save-btn:hover {
  background-color: #059669;
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
  margin-top: 1rem;
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

/* 图片链接展示区域样式 */
.image-url-section {
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

@media (max-width: 480px) {
  .url-display {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-url-btn {
    align-self: flex-end;
  }
}
</style>