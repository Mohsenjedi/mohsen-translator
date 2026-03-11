const recordBtn = document.getElementById('record-btn');
const btnText = document.getElementById('btn-text');
const sourceLangSelect = document.getElementById('source-lang-select');
const targetLangSelect = document.getElementById('target-lang-select');
const swapLangsBtn = document.getElementById('swap-langs');
const recognitionText = document.getElementById('recognition-text');
const translationText = document.getElementById('translation-text');
const subtitleText = document.getElementById('subtitle-text');
const sourceLangIndicator = document.getElementById('source-lang-indicator');
const targetLangIndicator = document.getElementById('target-lang-indicator');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const manualTextInput = document.getElementById('manual-text-input');
const translateBtn = document.getElementById('translate-btn');
const webcamElement = document.getElementById('webcam');
const cameraToggle = document.getElementById('camera-toggle');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

let isListening = false;
let recognition;
let stream = null;
let conversationHistory = JSON.parse(localStorage.getItem('mohsen_history') || '[]');

// Mapping for Speech Recognition Locales
const langLocales = {
    'en': 'en-US',
    'fi': 'fi-FI',
    'de': 'de-DE'
};

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        recordBtn.classList.add('listening');
        btnText.textContent = 'Stop Listening';
        updateStatus('Listening...', 'online');
    };

    recognition.onend = () => {
        isListening = false;
        recordBtn.classList.remove('listening');
        btnText.textContent = 'Start Listening';
        updateStatus('Ready', 'online');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
            recognitionText.innerHTML = `<span>${currentText}</span>`;
            
            if (interimTranscript) {
                translateText(interimTranscript, true);
            }
            
            if (finalTranscript) {
                translateText(finalTranscript, false);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        updateStatus(`Error: ${event.error}`, 'error');
        stopListening();
    };
} else {
    updateStatus('Speech API not supported', 'error');
    recordBtn.disabled = true;
}

// Camera Management
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        webcamElement.srcObject = stream;
        cameraToggle.classList.add('active');
        updateStatus('Camera Active', 'online');
    } catch (err) {
        console.error("Error accessing webcam:", err);
        updateStatus('Camera Error', 'error');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        webcamElement.srcObject = null;
        cameraToggle.classList.remove('active');
        updateStatus('Camera Off', 'online');
    }
}

// Translation Logic
async function translateText(text, isInterim = false) {
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    
    if (sourceLang === targetLang) {
        updateDisplays(text, isInterim);
        if (!isInterim) {
             saveToHistory(text, text, sourceLang, targetLang);
        }
        return;
    }

    if (!isInterim) updateStatus('Translating...', 'busy');
    
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            updateDisplays(translated, isInterim);
            if (!isInterim) {
                updateStatus('Translated', 'online');
                saveToHistory(text, translated, sourceLang, targetLang);
            }
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        if (!isInterim) {
            translationText.innerHTML = `<span class="error">Translation failed.</span>`;
            updateStatus('Error', 'error');
        }
    }
}

function updateDisplays(text, isInterim) {
    subtitleText.textContent = text;
    if (!isInterim) {
        translationText.innerHTML = `<span>${text}</span>`;
    }
}

// History Management
function saveToHistory(source, target, from, to) {
    const entry = {
        source,
        target,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    conversationHistory.unshift(entry);
    // Keep only last 50 entries
    conversationHistory = conversationHistory.slice(0, 50);
    localStorage.setItem('mohsen_history', JSON.stringify(conversationHistory));
    renderHistory();
}

function renderHistory() {
    if (conversationHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history"><p>No translations yet</p></div>';
        return;
    }

    historyList.innerHTML = conversationHistory.map(item => `
        <div class="history-item">
            <div class="history-meta">
                <span>${item.from} → ${item.to}</span>
                <span>${item.timestamp}</span>
            </div>
            <div class="history-text">
                <div class="history-source">${item.source}</div>
                <div class="history-target">${item.target}</div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Clear all translation history?')) {
        conversationHistory = [];
        localStorage.setItem('mohsen_history', JSON.stringify(conversationHistory));
        renderHistory();
    }
}

// UI Handlers
function updateIndicators() {
    const sourceName = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
    const targetName = targetLangSelect.options[targetLangSelect.selectedIndex].text;
    
    sourceLangIndicator.textContent = sourceName;
    targetLangIndicator.textContent = targetName;
    
    recognitionText.innerHTML = '<span class="placeholder">Speech will appear here...</span>';
    translationText.innerHTML = '<span class="placeholder">Translation will appear here...</span>';
    subtitleText.textContent = "Subtitles will appear here...";
}

function swapLanguages() {
    const temp = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = temp;
    updateIndicators();
}

function startListening() {
    recognition.lang = langLocales[sourceLangSelect.value] || 'en-US';
    recognition.start();
}

function stopListening() {
    recognition.stop();
}

function updateStatus(text, type) {
    statusText.textContent = text;
    statusDot.className = 'dot ' + type;
}

// Event Listeners
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-interface`) {
                content.classList.add('active');
            }
        });
        
        if (tabId !== 'voice') {
            if (isListening) stopListening();
            stopCamera();
        }

        if (tabId === 'history') {
            renderHistory();
        }
    });
});

translateBtn.addEventListener('click', () => {
    const text = manualTextInput.value.trim();
    if (text) {
        recognitionText.innerHTML = `<span>${text}</span>`;
        translateText(text, false);
    }
});

recordBtn.addEventListener('click', () => {
    if (isListening) stopListening();
    else startListening();
});

cameraToggle.addEventListener('click', () => {
    if (stream && stream.active) stopCamera();
    else startCamera();
});

clearHistoryBtn.addEventListener('click', clearHistory);

sourceLangSelect.addEventListener('change', updateIndicators);
targetLangSelect.addEventListener('change', updateIndicators);
swapLangsBtn.addEventListener('click', swapLanguages);

// Set initial state
updateIndicators();
renderHistory();
updateStatus('Ready', 'online');
startCamera();
