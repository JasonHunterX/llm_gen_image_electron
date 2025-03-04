<template>
  <div class="image-params-settings">
    <h3 class="params-title">春耕图片参数</h3>
    
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
      
      <!-- <div class="form-group">
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
      </div> -->
      
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
<!--       
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
      </div> -->
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
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px -1px rgba(122, 181, 92, 0.15);
  margin-bottom: 1.5rem;
  border: 1px solid #e6f3e6;
}

.params-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c5a1e;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #a8d5a8;
  padding-bottom: 0.75rem;
  text-align: center;
  font-family: "STKaiti", "楷体", "KaiTi", serif;
}

.params-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  background-color: rgba(248, 252, 245, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.95rem;
  color: #4a8c2e;
  font-weight: 500;
}

input[type="number"], select {
  padding: 0.625rem;
  border: 1px solid #a8d5a8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.9);
}

input[type="number"]:focus, select:focus {
  outline: none;
  border-color: #7ab55c;
  box-shadow: 0 0 0 3px rgba(122, 181, 92, 0.2);
}

.checkbox {
  flex-direction: row;
  align-items: center;
}

input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.75rem;
  accent-color: #7ab55c;
}

.random-btn {
  background-color: #7ab55c;
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
  background-color: #68a14a;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(122, 181, 92, 0.2);
}

.actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e6f3e6;
  display: flex;
  justify-content: flex-end;
}

.reset-params-btn {
  background-color: #f8fcf5;
  color: #4a8c2e;
  border: 1px solid #a8d5a8;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.reset-params-btn:hover {
  background-color: #e6f3e6;
  color: #2c5a1e;
  border-color: #7ab55c;
}

@media (max-width: 768px) {
  .params-form {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
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