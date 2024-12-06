import { useState, useEffect, useRef } from "react";

const useSpeechRecognition = (options = {}) => {
    const { lang = "en-US", continuous = false, interimResults = false } = options;

    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check for SpeechRecognition support
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
            console.error("SpeechRecognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcriptArray = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join("");
            setTranscript(transcriptArray);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setTranscript("");
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop(); // Clean up on unmount
            recognitionRef.current = null;
        }

    }, [lang, continuous, interimResults]);

    const startListening = () => {
        if (recognitionRef.current) { //} && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) { //} && isListening) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    const changeLang = (lang) => {
        recognitionRef.lang = lang;
    }




    return { transcript, isListening, startListening, stopListening, changeLang, setTranscript };
};

export default useSpeechRecognition;
