import { createStore } from 'vuex';
import { generateImage } from '../services/aiService';

export default createStore({
  state: {
    prompt: '',
    generatedImage: null,
    isLoading: false,
    isImageLoading: false,
    error: null,
    history: [],
    settings: {
      ollama: {
        apiUrl: 'http://127.0.0.1:11434',
        modelName: 'kevin_qwen:latest'
      }
    },
    notification: null
  },
  mutations: {
    setPrompt(state, prompt) {
      state.prompt = prompt;
    },
    setGeneratedImage(state, imageUrl) {
      state.generatedImage = imageUrl;
      if (imageUrl) {
        state.history.unshift({
          id: Date.now(),
          prompt: state.prompt,
          imageUrl
        });
      }
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    setImageLoading(state, status) {
      state.isImageLoading = status;
    },
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    },
    clearGeneratedImage(state) {
      state.generatedImage = null;
    },
    setSettings(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    setNotification(state, notification) {
      state.notification = notification;
    },
    clearNotification(state) {
      state.notification = null;
    }
  },
  actions: {
    async generateImageFromPrompt({ commit, state }) {
      try {
        commit('clearGeneratedImage'); // 清空之前的图片
        commit('setLoading', true);
        commit('setImageLoading', true);
        commit('clearError');
        
        const imageUrl = await generateImage(state.prompt, state.settings);
        commit('setGeneratedImage', imageUrl);
      } catch (error) {
        commit('setError', error.message || '生成图片时出错');
        console.error('Error generating image:', error);
      } finally {
        commit('setLoading', false);
      }
    },
    updatePrompt({ commit }, prompt) {
      commit('setPrompt', prompt);
    },
    updateSettings({ commit }, settings) {
      commit('setSettings', settings);
      // 保存到localStorage以实现持久化
      localStorage.setItem('aiImageGeneratorSettings', JSON.stringify(settings));
    },
    showNotification({ commit }, { message, type = 'success' }) {
      commit('setNotification', { message, type });
      setTimeout(() => {
        commit('clearNotification');
      }, 3000);
    },
    loadSettings({ commit }) {
      const savedSettings = localStorage.getItem('aiImageGeneratorSettings');
      if (savedSettings) {
        commit('setSettings', JSON.parse(savedSettings));
      }
    }
  },
  getters: {
    getPrompt: state => state.prompt,
    getGeneratedImage: state => state.generatedImage,
    isLoading: state => state.isLoading,
    isImageLoading: state => state.isImageLoading,
    getError: state => state.error,
    getHistory: state => state.history,
    getSettings: state => state.settings,
    getNotification: state => state.notification
  }
});