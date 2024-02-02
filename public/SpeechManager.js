class SpeechManager {
  constructor() {
    this.utterance = null;
    this.voices = {};
    window.speechSynthesis.onvoiceschanged = () =>{ this.setVoices() };
  }

  getSpeakDuration() {
    return this.utterance ? this.utterance.duration : 0;
  }

  speakItem(item) {
    item.sourceLang = `${item.sourceLang}-${item.sourceLang.toUpperCase()}`;
    item.targetLang = `${item.targetLang}-${item.targetLang.toUpperCase()}`;

    this.speak(item.sourceSentence, item.sourceLang).then(() => {
      this.speak(item.targetSentence, item.targetLang);
    });
  }

  speak(textToSpeak, textLang = "en-US") {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) { 

        const tempUtterance = new SpeechSynthesisUtterance(textToSpeak);

        tempUtterance.text = textToSpeak;
        tempUtterance.lang = textLang;
        tempUtterance.volume = 1;
        tempUtterance.voice = this.getVoice(textLang); 

        tempUtterance.onend = () => {
          console.log("onend", tempUtterance);
          resolve(tempUtterance);
        };

        tempUtterance.onerror = (error) => {
          console.error("onerror", 'Speech synthesis error:', error);
          reject({ error, textToSpeak, textLang });
        };

        speechSynthesis.speak(tempUtterance);
        this.utterance = tempUtterance; // Save the current utterance
      } else {
        console.log('Text-to-speech is not supported in your browser. Please use a modern browser.');
        reject(new Error('Text-to-speech not supported'));
      }
    });
  }

  pauseSpeak() {
    if (this.utterance) {
      speechSynthesis.pause();
    }
  }

  playSpeak() {
    if (this.utterance) {
      speechSynthesis.resume();
    }
  }

  isPaused() {
    return this.utterance ? speechSynthesis.paused : false;
  }

  isPlaying() {
    return this.utterance ? speechSynthesis.speaking : false;
  }

  getVoice(textLang) {
    return (this.voices[textLang] ?? [null])[0];
  }

  setVoices() {
      this.voices = {};
      let voices = speechSynthesis.getVoices();
      if(!voices.length){
        console.log("seeking... voices")
        let utterance = new SpeechSynthesisUtterance("");
        speechSynthesis.speak(utterance);
        voices = speechSynthesis.getVoices();
      }else {   }

      voices.map(voice => {
        this.voices[voice.lang] = this.voices[voice.lang] ?? [];
        this.voices[voice.lang].push(voice);
      });
      console.log("voices... ", this.voices)
  }
}
