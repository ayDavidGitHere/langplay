class Item {
    constructor(item) {
        // Assuming 'item' is an object with properties to be set on the class
        Object.assign(this, item); 
    }

    domApply() {
        const playbackItem = document.querySelector(`.playback-item[iid="${this.iid}"]`);
        if (!playbackItem) {
            console.log("Item Element not set");
            return;
        }

        playbackItem.setAttribute("active", this.active ? "yes" : "no");

        if (this.active) {
            playbackItem.scrollIntoView({ block: "center", behavior: "smooth" });
        }

        playbackItem.setAttribute("playing", this.playing ? "yes" : "no"); 
    }

    activate(applyDom = false) {
        this.active = true;
        this.playing = true;
        if (applyDom) this.domApply();
    }

    deactivate(applyDom = false) {
        this.active = false;
        this.playing = false;
        if (applyDom) this.domApply();
    }

    play(applyDom = false) {
        this.active = true;
        this.playing = true;
        if (applyDom) this.domApply();
    }

    resume(applyDom = false) {
        this.playing = true;
        if (applyDom) this.domApply();
    }

    pause(applyDom = false) {
        this.playing = false;
        if (applyDom) this.domApply(); 
    }

    togglePlaying(applyDom = false) {
        this.playing = !this.playing;
        if (applyDom) this.domApply();
    }
}
