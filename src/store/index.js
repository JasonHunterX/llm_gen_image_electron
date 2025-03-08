import { createStore } from 'vuex';
import { generateImage, generateAudio } from '../services/aiService';  // Add generateAudio import here

export default createStore({
  state: {
    prompt: '',
    generatedImage: null,
    isLoading: false,
    isImageLoading: false,
    error: null,
    history: [],
    settings: (() => {
      const savedSettings = localStorage.getItem('aiImageGeneratorSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (e) {
          console.error('解析保存的设置失败:', e);
        }
      }
      return {
        selectedService: 'ollama',
        ollama: {
          apiUrl: 'http://127.0.0.1:11434',
          modelName: 'kevin_qwen:latest'
        },
        deepseek: {
          apiKey: '',
          modelName: ''
        },
        imageParams: {
          width: 1024,
          height: 1024,
          seed: 100,
          model: 'flux',
          nologo: true,
          enhance: false
        }
      };
    })(),
    notification: null,
    generatedAudio: null,
    isAudioLoading: false,
    audioText: null,
  },
  mutations: {
    setAudioText(state, text) {
      state.audioText = text;
    },
    setGeneratedAudio(state, audioUrl) {
      state.generatedAudio = audioUrl;
    },
    setAudioLoading(state, status) {
      state.isAudioLoading = status;
    },
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
    
    updateImageParams(state, params) {
      state.settings.imageParams = { ...state.settings.imageParams, ...params };
    },
    
    setNotification(state, notification) {
      state.notification = notification;
    },
    clearNotification(state) {
      state.notification = null;
    }
  },
  actions: {
    async generateAudioFromPrompt({ commit, state }) {
      try {
        commit('setLoading', true);
        commit('setAudioLoading', true); // 添加这行
        commit('clearError');
        
        // 假设 generateAudio 函数返回 { audioUrl, audioText }
        const result = await generateAudio(state.prompt, state.settings);
        
        console.log('生成的音频结果:', result); // 添加调试日志
        
        commit('setGeneratedAudio', result.audioUrl);
        commit('setAudioText', result.audioText); // 设置音频文本
        
        commit('setLoading', false);
        commit('setAudioLoading', false); // 添加这行
      } catch (error) {
        console.error('生成音频失败:', error);
        commit('setError', error.message);
        commit('setLoading', false);
        commit('setAudioLoading', false); // 添加这行
      }
    },
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
    },
    
    updateImageParams({ commit }, params) {
      commit('updateImageParams', params);
      // Save to localStorage to persist the changes
      const settings = JSON.parse(localStorage.getItem('aiImageGeneratorSettings') || '{}');
      settings.imageParams = params;
      localStorage.setItem('aiImageGeneratorSettings', JSON.stringify(settings));
    }
  },
  getters: {
    getGeneratedAudio: (state) => state.generatedAudio,
    isAudioLoading: (state) => state.isAudioLoading,
    getAudioText: (state) => state.audioText,
    getPrompt: (state) => state.prompt,
    getGeneratedImage: (state) => state.generatedImage,
    isLoading: (state) => state.isLoading,
    isImageLoading: (state) => state.isImageLoading,
    getError: (state) => state.error,
    getHistory: (state) => state.history, // 移到这里
    getSettings: (state) => state.settings, // 移到这里
    getNotification: (state) => state.notification, // 移到这里
    getImageParams: (state) => state.settings.imageParams
  }
  // 删除下面这几行重复的 getters
  // getHistory: state => state.history,
  // getSettings: state => state.settings,
  // getNotification: state => state.notification,
  // getImageParams: state => state.settings.imageParams
})