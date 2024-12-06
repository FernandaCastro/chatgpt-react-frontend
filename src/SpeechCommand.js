import React, { useEffect, useState } from "react";

import axios from "axios";
import useSpeechRecognition from "./useSpeechRecognition";
import useSpeechSynthesis from "./useSpeechSynthesis";

const SpeechCommand = () => {

  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedLang, setSelectedLang] = useState('pt-BR');
  const [commandTranscript, setCommandTranscript] = useState(null);
  const [isListenToCommand, setIsListenToCommand] = useState(true);
  const [confirmationTranscript, setConfirmationTranscript] = useState();
  const [text, setText] = useState("");


  const { transcript, isListening, startListening, stopListening, changeLang, setTranscript } = useSpeechRecognition({
    lang: selectedLang,
    continuous: false,
    interimResults: false,
  });

  const { voices, changeVoice, speak } = useSpeechSynthesis(selectedLang);

  useEffect(() => {
    if (selectedLang) changeLang(selectedLang);

  }, [selectedLang])

  useEffect(() => {

    if (transcript && transcript.length > 0) {
      stopListening();

      if (isListenToCommand) {
        setCommandTranscript(transcript);
        confirmCommand(transcript);

      } else {
        setConfirmationTranscript(transcript);
        confirmation(transcript);

      }
    }

  }, [transcript])

  const processCommand = async () => {
    try {

      const res = await axios.post("http://localhost:5001/api/commandspeech",
        {
          commandTranscript,
        });

      if (res.data.status === 200) {
        setStatus("Command successfully recognized.")
        setMessage(res.data.result);
        return;
      }

      console.error("Error: ", res.data.status);
      setStatus(res.data.status);
      setMessage(res.data.error);

    } catch (error) {

      console.error("Error:", error);
      setStatus("Error");
    }
  };

  const startRecognitioin = () => {

    startListening();
  };

  const confirmCommand = async (newTranscript) => {

    if (!newTranscript) return;

    console.log("commandTranscript: ", newTranscript);

    await speak(`Você disse: ${newTranscript} ?`, selectedLang)

    setIsListenToCommand(!isListenToCommand);

    startRecognitioin();

  }

  const confirmation = async (newTranscript) => {

    if (newTranscript.includes("sim") || newTranscript.includes("sin") || newTranscript.includes("yes")) {
      console.log("Yes listened!");

      stopListening();
      processCommand();

    } else if (newTranscript.includes("não") || newTranscript.includes("no")) {
      console.log("No listened!");

      clear();

      await speak(`Por favor, Repita o comando.`, selectedLang)

      startRecognitioin();

    } else {
      console.error("Nothing listened!");
      await speak(`Desculpe. Eu não entendi.`, selectedLang)
      stopListening();
      clear();
    }

    setIsListenToCommand(!isListenToCommand);

  }

  const clear = () => {
    console.log("Clear function called");
    stopListening();

    setCommandTranscript();
    setConfirmationTranscript();
    setStatus();
    setMessage();
    setTranscript();
  }

  return (
    <div >
      <h3>Speech Command</h3>
      <select value={selectedLang} onChange={(event) => setSelectedLang(event.target.value)}>
        <option value="pt-BR">pt-BR</option>
        <option value="en-US">en-US</option>
        <option value="de-DE">de-DE</option>
      </select>

      <button onClick={() => startRecognitioin()} style={{ marginLeft: 10 }} disabled={isListening}>{isListening ? "Listening..." : "Talk"}</button>
      <button onClick={() => stopListening()} style={{ marginLeft: 10 }} disabled={!isListening}>Stop</button>
      <button onClick={clear} style={{ marginLeft: 10 }} disabled={!transcript}>Clear</button>

      <div style={{ marginLeft: "40%", textAlign: "left" }}>
        {/* <p>Command Transcript: "{commandTranscript}"</p>
        <p>Confirmation Transcript: "{confirmationTranscript}"</p> */}
        <p>Status: {status}</p>
        <p>Result: {message}</p>
      </div>

      <div >
        <h4>Voice test</h4>
        <input type="text" value={text} style={{ width: "320px", marginBottom: 10 }} onChange={(e) => setText(e.target.value)} />
        <div>
          <select key={voices.length} onChange={(event) => changeVoice(event.target.value)}>
            {voices.map((voice) => <option key={voice.name} value={voice.name}>{voice.lang} : {voice.name}</option>)}
          </select>
          <button onClick={() => speak(text)} style={{ marginLeft: 10 }} >Speak</button>
        </div>
      </div>

    </div>
  );
};

export default SpeechCommand;
