const Sentencer = require('sentencer');
const randomWords = require('./lib/random-words-node');
const nlp = require('compromise/three');
const gt = require('@plainheart/google-translate-api');
const gt_polyfill = async function (...args) {
    try {
        return await gt(...args); 
    }catch(e) {
        console.log("cannot translate");
        return { text: args[0] };
    }
}


const disableConsoleLog = require('./lib/disableConsoleLog');

// Disable console.log
//const enableConsoleLog = disableConsoleLog();




class SentenceGenerator {
    static async get(currentSentence, numberOfResults, langOptions = { from: "en", to: "ru" }) {
        const generatedSentences = [];

        for (let i = 1; i <= numberOfResults; i++) {
            let generatedSentence = this.getEnSentenceWithNLP();
            let sourceLanguageSentence = await this.getSentenceInSourceLang(generatedSentence, langOptions);
            let targetLanguageSentence = await this.getSentenceInTargetLang(generatedSentence, langOptions);
            generatedSentences.push({
                iid: `gen_${i}_${Math.floor(Math.random()*22222)}`,
                sourceSentence: sourceLanguageSentence,
                targetSentence: targetLanguageSentence,
                sourceLang: langOptions.sourceLang,
                targetLang: langOptions.targetLang,
            });
        }

        return generatedSentences;
    }

    static getEnSentenceWithNLP() {
        console.log("\n process: getEnSentenceWithNLP")

        const sentence = SentenceGenerator.generate();
        // Placeholder code to generate a random sentence using 'compromise'
        return sentence;
    }

    static async getSentenceInSourceLang(sentence, langOptions) {
        //return sentence;
        if(langOptions.sourceLang == "en") return sentence;
        langOptions = { from: "en", to: langOptions.sourceLang }
        console.log("\n process: getSentenceTranslation", langOptions)
        const translation = await gt_polyfill(sentence, langOptions);
        const translatedSentence = translation.text;
        // Placeholder code for sentence translation, replace with your translation logic
        return translatedSentence;
    }

    static async getSentenceInTargetLang(sentence, langOptions) {
        //return sentence;
        langOptions = { from: langOptions.sourceLang, to: langOptions.targetLang }
        console.log("\n process: getSentenceTranslation", langOptions)
        const translation = await gt_polyfill(sentence, langOptions);
        const translatedSentence = translation.text;
        // Placeholder code for sentence translation, replace with your translation logic
        return translatedSentence;
    }
    
    static generate() { 
        let permutations = [
              [  'Determiner','Adjective','Adjective|Comparative','Noun|Singular','Verb|PresentTense','Adjective','Determiner','Adjective','Noun|Singular' ],
              [  'Noun|Pronoun','Verb|Copula|PresentTense','Adverb','Adjective','Conjunction','Verb|PresentTense|Infinitive','Conjunction','Verb|PresentTense|Infinitive','Conjunction','Verb|PresentTense|Infinitive','Preposition','Verb|PresentTense|Infinitive'],
              /*
              ["article", "noun", "verb", "adjective", "noun"],
              ["pronoun", "verb", "adverb", "verb", "noun"],
              ["adjective", "noun", "verb", "conjunction", "pronoun"],
              ["adverb", "verb", "preposition", "noun", "interjection"],
              ["article", "adjective", "noun", "verb", "adjective"],
              ["noun", "verb", "conjunction", "pronoun", "verb"],
              ["preposition", "pronoun", "verb", "adjective", "noun"],
              ["adjective", "noun", "conjunction", "adjective", "noun"],
              ["pronoun", "verb", "preposition", "article", "noun"],
              ["adjective", "noun", "verb", "adjective", "noun"],
              ["adverb", "verb", "preposition", "pronoun", "adjective"],
              ["noun", "verb", "adverb", "verb", "noun"],
              ["pronoun", "verb", "preposition", "adjective", "noun"],
              ["preposition", "pronoun", "adverb", "verb", "adjective"],
              ["adverb", "verb", "preposition", "article", "noun"]*/
        ];

        function getRandomPermutation() {
           return permutations[Math.floor(Math.random() * permutations.length)];
        }

        function getRandomWord() {
            return randomWords.generate();
        }


        function matchPOS(word, pos) {
            return SentenceGenerator.getPOS(word)[0] === (pos);
            // Use "compromise" to analyze the part of speech of the word
            const analyzedWord = nlp(word);
            
            const posConfig = `#${pos.replace("|", " #")}`;

            const hasMatch = analyzedWord.has(posConfig); 
            // Check if the word's part of speech matches the provided pos
            return hasMatch;
        }


        function createSentenceTemplate() {
            let sentenceTemplate = "";
            let permutation = getRandomPermutation();
            console.log(permutation)

            let callStack = 0;
            function addToTemplate(pos) {
                callStack++;
                let word = getRandomWord();
                if(callStack >= 500) {
                    console.log("\x1b[31m%s\x1b[0m", `\nmaximum call stack ${callStack} for:`, "\n[pos]", `#${pos.replace("|", " #")}`, "\n[word]", word);
                    sentenceTemplate += word + " ";
                    callStack = 0;
                    return;
                }
                if (matchPOS(word, pos)) {
                    console.log("\x1b[34m%s\x1b[0m", `\nfoundat call stack ${callStack} for:`, "\n[pos]", `#${pos.replace("|", " #")}`, "\n[word]", word);
                    sentenceTemplate += word + " ";
                    callStack = 0;
                } else {
                    addToTemplate(pos);
                }
            }

            permutation.forEach(pos => {
                if (pos === "   Adjective") {
                    sentenceTemplate += "{{Adjective}} ";
                } else if (pos === "  Noun") {
                    sentenceTemplate += "{{Noun}} ";
                } else {
                    addToTemplate(pos);
                }
            });

            return sentenceTemplate.trim();
        }

        let sentenceTemplate = createSentenceTemplate();
        // Use "Sentencer" to create a compound sentence with a dependent clause
        const sentence = Sentencer.make(sentenceTemplate);

        return sentence;
    }

    static getPOS(sentence) {
        let posArray = [];
        let sentenceArray = sentence.split(" ");
        let tags = nlp(sentence).terms()
        .data()
        .map(term => term.terms[0].tags);
        tags.map((tag, tagIndex)=> {
            posArray.push(tag.join("|"));
        });
        return posArray;
    }

    static testMatchPOS(word, pos) { 
        console.log( SentenceGenerator.getPOS(word)[0].includes(pos) );
    }

}

module.exports = { SentenceGenerator };
