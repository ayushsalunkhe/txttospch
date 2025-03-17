# VoiceWave - Text to Speech Converter

VoiceWave is a modern, browser-based text-to-speech converter that allows you to convert text to speech in multiple languages and voices. It uses the Web Speech API, which is available in most modern browsers.

## Features

- Convert text to speech in real-time
- Support for multiple languages and voices (depends on your browser and operating system)
- Adjust speech rate, pitch, and volume
- Pause, resume, and stop speech playback
- Character counter with limit
- Responsive design for desktop and mobile devices
- Language selection via dropdown or quick-access badges

## How to Use

1. Open `index.html` in a modern browser (Chrome, Edge, or Safari recommended)
2. Enter the text you want to convert to speech in the text area
3. Select your preferred language and voice from the dropdown menus
4. Adjust the speech rate, pitch, and volume using the sliders
5. Click the "Speak" button to hear the text
6. Use the pause, resume, and stop buttons to control playback

## Browser Compatibility

VoiceWave uses the Web Speech API, which is supported in most modern browsers:

- Google Chrome (desktop and mobile)
- Microsoft Edge
- Safari (desktop and mobile)
- Firefox (partial support)

If your browser doesn't support the Web Speech API, you'll see a notice.

## Download Feature

The download feature requires an API key from [Voice RSS](https://www.voicerss.org/). To enable this feature:

1. Sign up for a free API key at [Voice RSS](https://www.voicerss.org/)
2. Open `js/app.js` and replace the empty `apiKey` variable with your API key

## Local Development

To run this project locally, you can use any local server. For example, with Python:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Or with Node.js:

```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server
```

Then open your browser and navigate to `http://localhost:8000` (or the port shown in your terminal).

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Built with the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/) 