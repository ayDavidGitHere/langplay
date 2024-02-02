// language.js
function language() { 
    const languageOptions = [
        { id: "en", label: "English" },
        { id: "ru", label: "Russian" },
        { id: "fr", label: "French" },
        { id: "es", label: "Spanish" },
        { id: "de", label: "German" },
        { id: "it", label: "Italian" },
        { id: "ja", label: "Japanese" },
        { id: "ko", label: "Korean" },
        { id: "zh", label: "Chinese" },
        { id: "ar", label: "Arabic" },
        { id: "hi", label: "Hindi" },
        { id: "pt", label: "Portuguese" },
        { id: "nl", label: "Dutch" },
        { id: "sv", label: "Swedish" },
        { id: "tr", label: "Turkish" },
        { id: "pl", label: "Polish" },
        { id: "vi", label: "Vietnamese" },
        { id: "th", label: "Thai" },
        { id: "id", label: "Indonesian" },
        { id: "ms", label: "Malay" },
        { id: "fi", label: "Finnish" },
        { id: "cs", label: "Czech" },
        { id: "hu", label: "Hungarian" },
        { id: "da", label: "Danish" },
        { id: "no", label: "Norwegian" },
        { id: "el", label: "Greek" },
        { id: "he", label: "Hebrew" },
        { id: "ro", label: "Romanian" }
    ];

    function getOptions() {
        return languageOptions;
    }

    return { getOptions };
}