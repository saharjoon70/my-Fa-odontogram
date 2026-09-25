// import { createApp } from "vue";
// import App from "./App.vue";
// import "./index.css";

// import './style.css'
// const fontLink = document.createElement('link')
// fontLink.rel = 'stylesheet'
// fontLink.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css'
// document.head.appendChild(fontLink)
// const rootEl = document.getElementById("app");
// if (rootEl) {
//   createApp(App, { enableNotes: true }).mount(rootEl);
// }


// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import "./style.css";

const app = createApp(App);
app.mount("#app");

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";
document.head.appendChild(fontLink);

