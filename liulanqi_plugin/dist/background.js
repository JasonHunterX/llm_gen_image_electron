chrome.runtime.onInstalled.addListener(()=>{chrome.storage.local.set({settings:{ollama:{apiUrl:"http://localhost:11434",modelName:"kevin_qwen:latest"},imageParams:{width:1024,height:1024,seed:100,model:"flux",nologo:!0,enhance:!1}},history:[]}),console.log("班大师AI图片生成器已安装/更新")});chrome.runtime.onMessage.addListener((e,n,t)=>(e.type==="SHOW_NOTIFICATION"&&chrome.runtime.sendMessage({type:"NOTIFICATION",notification:e.notification}),!0));chrome.runtime.onMessage.addListener((e,n,t)=>{if(e.type==="GENERATE_IMAGE")return handleImageGeneration(e.prompt,e.settings).then(t).catch(o=>t({error:o.message})),!0});
