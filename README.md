# Mohsen App - Live Voice & Text Translator 🌐

Mohsen App is a premium, real-time translation web application featuring live webcam subtitles, voice recognition, and manual text translation. It supports English, Finnish, and German with a sleek, modern UX.

## ✨ Features

- **Live Webcam Subtitles**: Show your webcam feed with real-time translated subtitles as you speak.
- **Voice Recognition**: Powerful speech-to-text for English, Finnish, and German.
- **Bi-directional Translation**: Easily switch between any of the supported languages.
- **Text Translator**: Manual input tab for translating written text.
- **Conversation History**: Automatically saves your translations to local storage for later review.
- **Premium Design**: A responsive, red-and-white themed glassmorphic UI with smooth animations.
- **Low Latency**: Optimized for real-time feedback using interim speech results.

## 🚀 Live Demo

Check out the live application here:
**[Mohsen App Live Demo](https://Mohsenjedi.github.io/mohsen-translator/)**

## 🛠️ Technology Stack

- **HTML5**: Semantic structure.
- **Vanilla CSS**: Custom design system with CSS variables and glassmorphism.
- **JavaScript**: Core logic for speech recognition, camera management, and API integration.
- **Web Speech API**: For real-time voice-to-text.
- **MyMemory API**: For fast, free translation.
- **MediaDevices API**: For webcam integration.

## 📦 Local Installation

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/translation-app.git
   ```
2. Navigate to the directory:
   ```bash
   cd translation-app
   ```
3. Use a local server to run the app (required for Speech API and Webcam):
   ```bash
   npx http-server .
   ```
4. Open your browser at `http://localhost:8080`.

## 📝 How to Use

1. **Voice Mode**: Ensure you grant microphone and camera permissions. Click "Start Listening" and speak.
2. **Subtitles**: Subtitles will appear live on the video feed in your selected target language.
3. **Toggle Languages**: Use the dropdown menus at the top to change the "From" and "To" languages.
4. **History**: View your past translations in the "History" tab.

---
Developed by Antigravity AI for Mohsen.
