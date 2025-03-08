<template>
  <div class="image-params-settings">
    <details class="params-section" open>
      <summary class="params-title">图片生成参数</summary>
      <div class="params-form">
        <div class="params-group">
          <h4 class="group-title">尺寸设置</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="width">宽度</label>
              <input type="number" id="width" v-model.number="params.width" @change="updateParams" min="256" max="2048" step="64" />
            </div>
            <div class="form-group">
              <label for="height">高度</label>
              <input type="number" id="height" v-model.number="params.height" @change="updateParams" min="256" max="2048" step="64" />
            </div>
          </div>
        </div>

        <div class="params-group">
          <h4 class="group-title">生成选项</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="seed">随机种子</label>
              <div class="input-with-button">
                <input type="number" id="seed" v-model.number="params.seed" @change="updateParams" min="0" max="1000" />
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
          </div>
          <div class="form-row checkbox-row">
            <div class="form-group checkbox">
              <input type="checkbox" id="nologo" v-model="params.nologo" @change="updateParams" />
              <label for="nologo">隐藏水印</label>
            </div>
            <div class="form-group checkbox">
              <input type="checkbox" id="enhance" v-model="params.enhance" @change="updateParams" />
              <label for="enhance">提升质量</label>
            </div>
          </div>
        </div>

        <div class="params-group">
          <h4 class="group-title">音频设置</h4>
          <div class="form-group">
            <label for="voice">声音选项</label>
            <select id="voice" v-model="params.voice" @change="updateParams">
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
              <option value="coral">Coral</option>
              <option value="verse">Verse</option>
              <option value="ballad">Ballad</option>
              <option value="ash">Ash</option>
              <option value="sage">Sage</option>
              <option value="amuch">Amuch</option>
              <option value="aster">Aster</option>
              <option value="brook">Brook</option>
              <option value="clover">Clover</option>
              <option value="dan">Dan</option>
              <option value="elan">Elan</option>
              <option value="marilyn">Marilyn</option>
              <option value="meadow">Meadow</option>
            </select>
          </div>
        </div>
      </div>
    </details>
    
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
    
    const params = ref({
      width: 1024,
      height: 1024,
      seed: 100,
      model: 'flux',
      nologo: true,
      voice: 'nova'
    });
    
    onMounted(() => {
      params.value = { ...params.value, ...storeParams.value };
    });
    
    const updateParams = () => {
      store.dispatch('updateImageParams', params.value);
    };
    
    const randomizeSeed = () => {
      params.value.seed = Math.floor(Math.random() * 1000);
      updateParams();
    };
    
    const resetToDefaults = () => {
      params.value = {
        width: 1024,
        height: 1024,
        seed: 100,
        model: 'flux',
        nologo: true,
        voice: 'nova'
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
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.params-section {
  margin-bottom: 1rem;
}

.params-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  padding: 0.5rem 0;
  user-select: none;
}

.params-form {
  padding-top: 0.5rem;
}

.params-group {
  margin-bottom: 1.5rem;
}

.group-title {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.form-group {
  flex: 1;
  min-width: 0;
}

.checkbox-row {
  display: flex;
  gap: 2rem;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}

input[type="number"], select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: #f9fafb;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.random-btn {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.actions {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.reset-params-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .checkbox-row {
    flex-direction: row;
    gap: 1rem;
  }
}
</style>