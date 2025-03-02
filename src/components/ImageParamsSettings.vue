<template>
  <div class="image-params-settings">
    <h3 class="params-title">图片生成参数</h3>
    
    <div class="params-form">
      <div class="form-group">
        <label for="width">宽度</label>
        <input 
          type="number" 
          id="width" 
          v-model.number="params.width" 
          @change="updateParams"
          min="256"
          max="2048"
          step="64"
        />
      </div>
      
      <div class="form-group">
        <label for="height">高度</label>
        <input 
          type="number" 
          id="height" 
          v-model.number="params.height" 
          @change="updateParams"
          min="256"
          max="2048"
          step="64"
        />
      </div>
      
      <div class="form-group">
        <label for="seed">随机种子</label>
        <div class="input-with-button">
          <input 
            type="number" 
            id="seed" 
            v-model.number="params.seed" 
            @change="updateParams"
            min="0"
            max="1000"
          />
          <button @click="randomizeSeed" class="random-btn">随机</button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="model">模型</label>
        <select id="model" v-model="params.model" @change="updateParams">
          <option value="flux">Flux</option>
          <option value="flux-pro">Flux-pro</option>
          <option value="flux-realism">Flux-realism</option>
          <option value="flux-anime">Flux-anime</option>
          <option value="flux-3d">Flux-3d</option>
          <option value="flux-cablyai">Flux-cablyai</option>
          <option value="turbo">Turbo</option>
        </select>
      </div>
      
      <div class="form-group checkbox">
        <input 
          type="checkbox" 
          id="nologo" 
          v-model="params.nologo" 
          @change="updateParams"
        />
        <label for="nologo">隐藏水印</label>
      </div>
      <div class="form-group checkbox">
        <input 
          type="checkbox" 
          id="enhance" 
          v-model="params.enhance" 
          @change="updateParams"
        />
        <label for="enhance">提升质量</label>
      </div>
    </div>
    
    <div class="actions">
      <button @click="resetToDefaults" class="reset-params-btn">恢复默认设置</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ImageParamsSettings',
  setup() {
    const store = useStore();
    const storeParams = computed(() => store.getters.getImageParams);
    
    // 本地参数状态
    const params = ref({
      width: 1024,
      height: 1024,
      seed: 100,
      model: 'flux',
      nologo: true
    });
    
    // 初始化参数
    onMounted(() => {
      params.value = { ...params.value, ...storeParams.value };
    });
    
    // 更新参数到store
    const updateParams = () => {
      store.dispatch('updateImageParams', params.value);
    };
    
    // 随机种子
    const randomizeSeed = () => {
      params.value.seed = Math.floor(Math.random() * 1000);
      updateParams();
    };
    
    // 重置为默认值
    const resetToDefaults = () => {
      params.value = {
        width: 1024,
        height: 1024,
        seed: 100,
        model: 'flux',
        nologo: true
      };
      updateParams();
    };
    
    return {
      params,
      updateParams,
      randomizeSeed,
      resetToDefaults
    };
  }
}
</script>

<style scoped>
.image-params-settings {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
}

.params-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.params-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0;
}

label {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
}

input[type="number"], select {
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

input[type="number"]:focus, select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.75rem;
  accent-color: #6366f1;
}

.random-btn {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
}

.random-btn:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.reset-params-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.reset-params-btn:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

@media (max-width: 768px) {
  .params-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .image-params-settings {
    padding: 1rem;
  }
  
  .actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }
}
</style>