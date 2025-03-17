document.addEventListener('DOMContentLoaded', () => {
    // Check if browser supports Speech Synthesis
    if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        let voices = [];
        
        // DOM Elements
        const textInput = document.getElementById('text-input');
        const languageSelect = document.getElementById('language-select');
        const voiceSelect = document.getElementById('voice-select');
        const rateInput = document.getElementById('rate');
        const rateValue = document.getElementById('rate-value');
        const pitchInput = document.getElementById('pitch');
        const pitchValue = document.getElementById('pitch-value');
        const volumeInput = document.getElementById('volume');
        const volumeValue = document.getElementById('volume-value');
        const speakBtn = document.getElementById('speak-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const stopBtn = document.getElementById('stop-btn');
        const downloadBtn = document.getElementById('download-btn');
        const statusMessage = document.getElementById('status-message');
        const progressBar = document.getElementById('progress-bar');
        const currentChars = document.getElementById('current-chars');
        const maxChars = document.getElementById('max-chars');
        const languageBadges = document.getElementById('language-badges');
        
        // State variables
        let currentUtterance = null;
        let isSpeaking = false;
        let languageMap = new Map();
        const MAX_CHARS = 500;
        
        // Initialize
        init();
        
        function init() {
            // Set max characters
            maxChars.textContent = MAX_CHARS;
            
            // Get available voices
            loadVoices();
            
            // Chrome loads voices asynchronously
            if (synth.onvoiceschanged !== undefined) {
                synth.onvoiceschanged = loadVoices;
            }
            
            // Event listeners
            textInput.addEventListener('input', handleTextInput);
            languageSelect.addEventListener('change', handleLanguageChange);
            voiceSelect.addEventListener('change', updateExample);
            rateInput.addEventListener('input', handleRateChange);
            pitchInput.addEventListener('input', handlePitchChange);
            volumeInput.addEventListener('input', handleVolumeChange);
            speakBtn.addEventListener('click', speak);
            pauseBtn.addEventListener('click', pause);
            resumeBtn.addEventListener('click', resume);
            stopBtn.addEventListener('click', stop);
            downloadBtn.addEventListener('click', download);
        }
        
        function loadVoices() {
            // Get all available voices
            voices = synth.getVoices();
            
            if (voices.length === 0) {
                setTimeout(loadVoices, 100);
                return;
            }
            
            // Clear existing options
            languageSelect.innerHTML = '';
            voiceSelect.innerHTML = '';
            languageBadges.innerHTML = '';
            languageMap.clear();
            
            // Group voices by language
            voices.forEach(voice => {
                const langCode = voice.lang.split('-')[0];
                const langName = getLanguageName(voice.lang);
                
                if (!languageMap.has(langCode)) {
                    languageMap.set(langCode, {
                        name: langName,
                        voices: []
                    });
                }
                
                languageMap.get(langCode).voices.push(voice);
            });
            
            // Sort languages alphabetically
            const sortedLanguages = Array.from(languageMap.entries()).sort((a, b) => {
                return a[1].name.localeCompare(b[1].name);
            });
            
            // Populate language select
            sortedLanguages.forEach(([langCode, langData]) => {
                const option = document.createElement('option');
                option.value = langCode;
                option.textContent = `${langData.name} (${langData.voices.length})`;
                languageSelect.appendChild(option);
                
                // Create language badge
                const badge = document.createElement('div');
                badge.classList.add('language-badge');
                badge.dataset.lang = langCode;
                badge.textContent = langData.name;
                badge.addEventListener('click', () => {
                    languageSelect.value = langCode;
                    languageSelect.dispatchEvent(new Event('change'));
                    
                    // Update active badge
                    document.querySelectorAll('.language-badge').forEach(b => {
                        b.classList.remove('active');
                    });
                    badge.classList.add('active');
                });
                languageBadges.appendChild(badge);
            });
            
            // Set default language (English if available)
            const defaultLang = languageMap.has('en') ? 'en' : sortedLanguages[0][0];
            languageSelect.value = defaultLang;
            
            // Make sure the element exists before trying to add a class to it
            const defaultBadge = document.querySelector(`.language-badge[data-lang="${defaultLang}"]`);
            if (defaultBadge) {
                defaultBadge.classList.add('active');
            }
            
            // Trigger language change to populate voice select
            handleLanguageChange();
        }
        
        function handleLanguageChange() {
            const langCode = languageSelect.value;
            const langData = languageMap.get(langCode);
            
            // Check if langData exists
            if (!langData) {
                console.error('Language data not found for code:', langCode);
                return;
            }
            
            const langVoices = langData.voices;
            
            // Clear voice select
            voiceSelect.innerHTML = '';
            
            // Populate voice select
            langVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} ${voice.default ? '(Default)' : ''}`;
                voiceSelect.appendChild(option);
                
                // Select default voice if available
                if (voice.default) {
                    voiceSelect.value = voice.name;
                }
            });
            
            // If no default voice, select the first one
            if (voiceSelect.value === '') {
                voiceSelect.selectedIndex = 0;
            }
            
            updateExample();
        }
        
        function handleTextInput() {
            const text = textInput.value;
            currentChars.textContent = text.length;
            
            // Limit text length
            if (text.length > MAX_CHARS) {
                textInput.value = text.substring(0, MAX_CHARS);
                currentChars.textContent = MAX_CHARS;
            }
            
            // Update speak button state
            speakBtn.disabled = text.trim().length === 0;
        }
        
        function handleRateChange() {
            rateValue.textContent = rateInput.value;
        }
        
        function handlePitchChange() {
            pitchValue.textContent = pitchInput.value;
        }
        
        function handleVolumeChange() {
            volumeValue.textContent = volumeInput.value;
        }
        
        function updateExample() {
            // Update status message with selected voice
            const selectedVoice = getSelectedVoice();
            if (selectedVoice) {
                statusMessage.textContent = `Ready with ${selectedVoice.name} (${getLanguageName(selectedVoice.lang)})`;
            }
        }
        
        function speak() {
            const text = textInput.value.trim();
            
            if (!text) {
                return;
            }
            
            // Create a new utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set utterance properties
            utterance.voice = getSelectedVoice();
            utterance.rate = parseFloat(rateInput.value);
            utterance.pitch = parseFloat(pitchInput.value);
            utterance.volume = parseFloat(volumeInput.value);
            
            // Set up event handlers
            utterance.onstart = () => {
                isSpeaking = true;
                statusMessage.textContent = 'Speaking...';
                updateButtonStates();
            };
            
            utterance.onpause = () => {
                statusMessage.textContent = 'Paused';
                updateButtonStates();
            };
            
            utterance.onresume = () => {
                statusMessage.textContent = 'Speaking...';
                updateButtonStates();
            };
            
            utterance.onend = () => {
                isSpeaking = false;
                statusMessage.textContent = 'Finished';
                progressBar.style.width = '0%';
                currentUtterance = null;
                updateButtonStates();
            };
            
            utterance.onerror = (event) => {
                isSpeaking = false;
                statusMessage.textContent = `Error: ${event.error}`;
                updateButtonStates();
            };
            
            // Update progress
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const progress = (event.charIndex / text.length) * 100;
                    progressBar.style.width = `${Math.min(progress, 100)}%`;
                }
            };
            
            // Store current utterance
            currentUtterance = utterance;
            
            // Speak
            synth.cancel(); // Cancel any ongoing speech
            synth.speak(utterance);
            
            updateButtonStates();
        }
        
        function pause() {
            if (synth.speaking) {
                synth.pause();
                updateButtonStates();
            }
        }
        
        function resume() {
            if (synth.paused) {
                synth.resume();
                updateButtonStates();
            }
        }
        
        function stop() {
            synth.cancel();
            isSpeaking = false;
            statusMessage.textContent = 'Stopped';
            progressBar.style.width = '0%';
            currentUtterance = null;
            updateButtonStates();
        }
        
        function download() {
            const text = textInput.value.trim();
            
            if (!text) {
                statusMessage.textContent = 'Please enter text to download';
                return;
            }
            
            statusMessage.textContent = 'Preparing download...';
            statusMessage.classList.add('loading');
            
            // Create a temporary audio element
            const audio = new Audio();
            const selectedVoice = getSelectedVoice();
            
            // Use a simple API to convert text to speech and download
            // Note: This is a fallback method as direct download from Web Speech API is not supported
            const apiKey = ''; // Get a free API key from voicerss.org
            const langCode = selectedVoice.lang;
            const rate = Math.round(parseFloat(rateInput.value) * 0);
            
            // If no API key, show message
            if (!apiKey) {
                statusMessage.textContent = 'Download requires an API key from voicerss.org';
                statusMessage.classList.remove('loading');
                return;
            }
            
            const url = `https://api.voicerss.org/?key=${apiKey}&hl=${langCode}&v=${selectedVoice.name}&r=${rate}&c=mp3&f=16khz_16bit_stereo&src=${encodeURIComponent(text)}`;
            
            audio.src = url;
            audio.onloadedmetadata = () => {
                // Create download link
                const link = document.createElement('a');
                link.href = url;
                link.download = 'speech.mp3';
                link.click();
                
                statusMessage.textContent = 'Download started';
                statusMessage.classList.remove('loading');
            };
            
            audio.onerror = () => {
                statusMessage.textContent = 'Download failed. Check API key or try again later.';
                statusMessage.classList.remove('loading');
            };
        }
        
        function updateButtonStates() {
            speakBtn.disabled = isSpeaking || textInput.value.trim().length === 0;
            pauseBtn.disabled = !isSpeaking || synth.paused;
            resumeBtn.disabled = !synth.paused;
            stopBtn.disabled = !isSpeaking;
        }
        
        function getSelectedVoice() {
            const selectedVoiceName = voiceSelect.value;
            return voices.find(voice => voice.name === selectedVoiceName);
        }
        
        function getLanguageName(langCode) {
            // Map language codes to full names
            const languageNames = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'it': 'Italian',
                'pt': 'Portuguese',
                'ru': 'Russian',
                'ja': 'Japanese',
                'ko': 'Korean',
                'zh': 'Chinese',
                'ar': 'Arabic',
                'hi': 'Hindi',
                'nl': 'Dutch',
                'pl': 'Polish',
                'sv': 'Swedish',
                'tr': 'Turkish',
                'cs': 'Czech',
                'da': 'Danish',
                'fi': 'Finnish',
                'el': 'Greek',
                'he': 'Hebrew',
                'hu': 'Hungarian',
                'id': 'Indonesian',
                'no': 'Norwegian',
                'ro': 'Romanian',
                'sk': 'Slovak',
                'th': 'Thai',
                'vi': 'Vietnamese'
            };
            
            // Extract main language code (e.g., 'en-US' -> 'en')
            const mainCode = langCode.split('-')[0];
            
            // Return full name or code if not found
            return languageNames[mainCode] || langCode;
        }
    }
}); 