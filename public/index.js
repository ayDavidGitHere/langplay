

class Preferences {
    constructor(pageCtx) {
        this.pageCtx = pageCtx;
        this.loadElements();
        this.displayPrefs();
    }
    loadElements() {
        this.preferencesBox = document.querySelector(".preferences-box");
    }
    displayPrefs() {
        let languageOptions = language().getOptions() ?? [
            {id: "en", label: "English"},
            {id: "fr", label: "French"},
            {id: "ru", label: "Russian"},
        ];
        let prefs = this.getPrefs();

        let sourceOptionsHTML = languageOptions.map(option => {
            let selected = prefs.sourceLang == option.id ? "selected" : "";
            return `<option value="${option.id}" ${selected} >${option.label}</option>`;
        }).join("\n");
        let targetOptionsHTML = languageOptions.map(option => {
            let selected = prefs.targetLang == option.id ? "selected" : "";
            return `<option value="${option.id}" ${selected}>${option.label}</option>`;
        }).join("\n");

        this.preferencesBox.innerHTML += `
            <div class="setting-block setting-sourceLang" setting-sourceLang>
                <label>
                Source Language
                </label>
                <select>
                    ${sourceOptionsHTML}
                </select> 
            </div>
            <div class="setting-block setting-targetLang" setting-targetLang>
                <label>
                Target Language
                </label>
                <select>
                    ${targetOptionsHTML}
                </select> 
            </div>
            <div class="setting-block setting-darkMode" setting-darkMode>
                <label>
                Dark mode
                </label>
                <input type="radio" ${prefs.is_dark_mode ? "checked" : ""}></input>
            </div>
            <p class="preferences-save-btn">SAVE PREFERENCES</p>
            <p class="preferences-reset-btn">RESET</p> 
        `;

        this.preferencesBox.querySelector(".preferences-save-btn").onclick = (e) => {
            let prevText = e.target.innerText; 
            e.target.innerText = `SAVING ...`;
            this.setPrefs();
            setTimeout(()=>{e.target.innerText = prevText;}, 1500);
        }

        this.preferencesBox.querySelector(".preferences-reset-btn").onclick = (e) => {
            let prevText = e.target.innerText; 
            e.target.innerText = `RESETING ...`;
            this.resetPrefs();
            setTimeout(()=>{e.target.innerText = prevText;}, 1500);
        } 
    }
    getPrefs() {
        let prefs = {
            is_dark_mode: true,
            sourceLang: "en",
            targetLang: "ru",
        };

        if(window.localStorage.prefs) {
            let savedPrefs = JSON.parse(window.localStorage.prefs);
            prefs.is_dark_mode = savedPrefs.is_dark_mode ?? prefs.is_dark_mode;
            prefs.sourceLang = savedPrefs.sourceLang ?? prefs.sourceLang;
            prefs.targetLang = savedPrefs.targetLang ?? prefs.targetLang;
        }
        return prefs;
    }
    setPrefs() { 
        let prefs = {};
        let sourceLang = prefs.sourceLang = this.preferencesBox.querySelector("[setting-sourceLang] select").value;
        let targetLang = prefs.targetLang = this.preferencesBox.querySelector("[setting-targetLang] select").value;
        let is_dark_mode = prefs.is_dark_mode = this.preferencesBox.querySelector("[setting-darkMode] input[type='radio']").checked;
        console.log("saving preferences: ", sourceLang, targetLang, is_dark_mode);
        window.localStorage.prefs = JSON.stringify(prefs);
        this.pageCtx.reloadPageColorMode();
    }
    resetPrefs() {
        window.localStorage.prefs = false;

        this.pageCtx.reloadPageColorMode();
    }
}



class Page {
    constructor() {
        this.items = [];
        this.itemsExhaustIndex = 0;
        this.playbackBox = null;
        this.currentItem = null;
        this.currentItemIndex = 0;
        this.currentItemIid = 0;
        this.playbackStarted = false;
        this.speechManager = new SpeechManager();
    }

    loadItems() {
        this.items = [ 
        ];
    }

    loadElements() {
        this.pageBody = document.body;
        this.boxContainer = document.querySelector(".box-container");
        this.playbackBox = document.querySelector(".playback-box");
        this.navItems = [...document.querySelectorAll("[box-for]")];
    }

    reloadPageColorMode() {
        this.pageBody.setAttribute("color-mode", this.preferences.getPrefs().is_dark_mode?"dark":"light");
    }

    loadNavigation() {
        function setBox(forBox) {
            [...document.querySelectorAll(`[box-id]`)].map(box => {
                box.removeAttribute("active");
            });
            [...document.querySelectorAll(`[box-for]`)].map(navItem => {
                navItem.removeAttribute("active");
            });
            let box = document.querySelector(`[box-id="${forBox}"]`);
            let navItem = document.querySelector(`[box-for="${forBox}"]`);
            box.setAttribute("active", "");
            navItem.setAttribute("active", "");
            box.scrollIntoView({ block: "center",  behavior: "smooth", }); 
        }

        this.navItems.map((navItem)=> { 
            navItem.onclick = () => {
                let forBox = navItem.getAttribute("box-for");
                setBox(forBox); 
            }         
        })
    }

    loadPreferences() {
        this.preferences = new Preferences(this);
    }

    appendNewItems(raw_items) {  
        let new_items = [];
        raw_items.map((r_item, r_item_index) => {
            let item = new Item(r_item);
            item.deactivate(); 
            item.index = this.items.length;
            this.items.push(item);
            new_items.push(item);
        });
        this.displayNewItems(new_items);
    }

    displayNewItems(new_items) {  
        if(!this.playbackStarted) {
            setTimeout(() => {
                this.displayNewItems(new_items);
            }, 1000 * 2);
            return;
        }

        new_items.map((item, itemIndex) => {  
            this.displayNewItem(item, item.index);
            item.deactivate(true);
        });
        if(this.itemsExhaustIndex >= 0) {
            // if items is exhausted, restart playback
            this.items[this.itemsExhaustIndex].activate(true);
            this.startPlayback();
        }
        // console.log("exhausted: ", this.itemsExhaustIndex, this.items.length - this.currentItemIndex );
    }

    displayNewItem(item, itemIndex) {
        let playbackItem = document.createElement("div");
        this.playbackBox.appendChild(playbackItem)
        playbackItem.outerHTML = `
            <div class="playback-item" iid="${item.iid}">
                <span class="item-index">${itemIndex + 1}</span>
                <div class="item-sentences-cont">
                    <p class="item-sentence item-source-sentence">${item.sourceSentence}</p>
                    <p class="item-sentence item-target-sentence">${item.targetSentence}</p>
                </div>
                <span class="item-btn">
                    <span class="item-btn-play-icon fas fa-play"></span>
                    <span class="item-btn-pause-icon fas fa-pause"></span>
                </span>
                <span class="item-progress-cont">
                    <span class="item-progress"></span>
                </span>
            </div>
        `; 
        let playbackItemPlayBtn = this.playbackBox.querySelector(`.playback-item[iid="${item.iid}"] .item-btn`); 
        playbackItemPlayBtn.onclick  = () => {  
            this.playbackAction(item);
        }  
    }

    updatePlaybackBox() {
        this.items.forEach((item, itemIndex) => {
        });
    }

    startPlayback() {  
        this.updatePlaybackBox();
        this.items.forEach((item, itemIndex) => { 
            if (item.active) { 
                this.speechManager.speakItem(item);
                //console.log( "duration: ", this.speechManager.getSpeakDuration() );
                this.currentItem = item;
                this.currentItemIndex = itemIndex;
                this.currentItemIid = item.iid;

                let item_play_finish = false;
                let item_play_currenttime = 0;
                let item_play_endtime = 1000 * 30 / 1;

                let playInterval = setInterval(() => {
                    if (!item.active) {
                        this.speechManager.pauseSpeak();
                        clearInterval(playInterval);
                        return;
                    } 
                    if (item.playing && this.speechManager.isPaused()) {
                        this.speechManager.playSpeak();
                        console.log("playSpeak");
                    }
                    if (!item.playing && this.speechManager.isPlaying()) {
                        this.speechManager.pauseSpeak();
                        console.log("pauseSpeak");
                    }
                    if (!item.playing) return;


                    item_play_finish = item_play_currenttime >= item_play_endtime;
                    if (!item_play_finish) {
                        item_play_currenttime += 200;
                        let item_play_percenttime = (item_play_currenttime / item_play_endtime) * 100;
                        this.playbackBox.querySelector(`.playback-item[iid="${item.iid}"] .item-progress`).style.width = `${item_play_percenttime}%`;
                    } else {
                        //console.log("item item_play_finish", itemIndex)
                        clearInterval(playInterval);
                        this.items[itemIndex].deactivate(true);
                        if (this.items[itemIndex + 1]) { // there is more item to play
                            this.items[itemIndex + 1].activate(true);
                            this.itemsExhaustIndex = -1;
                        }else {  // no more item to play
                            this.itemsExhaustIndex = itemIndex + 1;
                        } 
                        this.startPlayback();
                    }
                }, 200);
            }
        }); 
    }

    displayPregenerationIcon(state="yes"){
        if (this.playbackBox.querySelector(".pregenerator-icon") == null) {
            let pregeneratorIcon = document.createElement("div");
            pregeneratorIcon.classList.add('pregenerator-icon');
            this.playbackBox.appendChild(pregeneratorIcon);
        }
        this.playbackBox.querySelector(".pregenerator-icon").setAttribute("visible", state);
    }

    pregenerateItems() { 
        if (this.items.length - this.currentItemIndex <= 2 && !this.pregeneration_running) {
            this.pregeneration_running = true;
            this.displayPregenerationIcon("yes");
            let currentSentence = this.currentItem?.sourceSentence ?? "";
            let languageOptions = { 
                    sourceLang: this.preferences.getPrefs().sourceLang,
                    targetLang: this.preferences.getPrefs().targetLang,
                }

            console.log("[fetching new items]progress ");
            fetch("http://localhost:7006/generate/sentence/from", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentSentence: currentSentence,
                    numberOfResults: 3,
                    sourceLang: languageOptions.sourceLang,
                    targetLang: languageOptions.targetLang,
                }),
            })
                .then(response => {
                    this.pregeneration_running = false;
                    this.displayPregenerationIcon("no");
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => { 
                    this.appendNewItems(result.items);
                    console.log("[fetching new items]done: ", this.items.length);
                })
                .catch(error => console.error("Error fetching additional items:", error));
        }
    }

    playbackAction(item) {
        if(item.playing) {
            item.pause(true);
        }else {
            this.items.map(_item => {
                _item.deactivate(true);
            }); 
            item.play(true);
            this.startPlayback();
        }  
    } 

    startup() {
        const startPlaybackBtn = document.createElement('span');  
        this.playbackBox.appendChild(startPlaybackBtn);
        startPlaybackBtn.addEventListener('click', () => { 
            startPlaybackBtn.setAttribute("visible", "no");
            this.playbackStarted = true; 
        }); 
        /*startPlaybackBtn.outerHTML = `
            <span class="start-playback-btn fas fa-play"></span> 
        `;  */
        startPlaybackBtn.classList.add('start-playback-btn', 'fas', 'fa-play');
    }
}

document.addEventListener('DOMContentLoaded', function () { 
    const page = new Page();


    page.loadElements();

    page.loadNavigation();
    page.loadPreferences();

    page.loadItems(); 
    page.startup();
         

    //attempt pregeneration every 1 minute
    page.pregenerateItems();
    setInterval(()=> {page.pregenerateItems()}, 1000 * 30);
});
