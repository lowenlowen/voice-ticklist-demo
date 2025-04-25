import React, { useState, useEffect, useRef } from "react";

const steps = [
  { label: "A/C Reg", question: "Is GLTTRH correct?" },
  { label: "A/C Type", question: "Is G-DRTA correct?" },
  { label: "ATA Chapter", question: "Is ATA 27 correct?" },
  { label: "Headline", input: true },
  { label: "Description", input: true },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [listComplete, setListComplete] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.trim();
      setTranscript(speechResult);
      if (speechResult.toLowerCase() === "yes" && !steps[currentStep].input) {
        handleConfirm("Yes");
      }
    };
    recognitionRef.current = recognition;
  }, [currentStep]);

  const startListening = () => {
    setTranscript("");
    recognitionRef.current?.start();
  };

  const handleConfirm = (response) => {
    const updatedResponses = [...responses];
    updatedResponses[currentStep] = response;
    setResponses(updatedResponses);
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
    } else {
      setListComplete(true);
    }
  };

  const handleInputChange = (e) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="grid grid-cols-3 h-screen bg-[#2f2f2f] text-white font-sans">
      <div className="col-span-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#1f1f1f] to-[#3a3a3a] rounded-l-xl">
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className={\`px-4 py-3 rounded-xl flex items-center justify-between transition-all ${index === currentStep ? "bg-[#4a4a4a] text-white" : "text-gray-400"}`}
            >
              <span className="text-base font-semibold">{step.label}</span>
              {responses[index] && (
                <span className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-sm">✔</span>
              )}
            </li>
          ))}
        </ul>
        <button
          className={\`mt-8 w-full text-lg py-3 rounded-full transition-all \${listComplete ? "bg-white text-black" : "bg-black text-white opacity-60 cursor-not-allowed"}\`}
          disabled={!listComplete}
        >
          {listComplete ? "Sent" : "Send"}
        </button>
      </div>

      <div className="col-span-2 flex flex-col justify-center items-center bg-[#4a4a4a] px-12 rounded-r-xl">
        <div className="w-full max-w-2xl">
          <div className="flex items-start mb-6">
            <div className="bg-[#3a3a3a] px-6 py-4 rounded-xl shadow text-white text-lg font-medium">
              {steps[currentStep]?.question || steps[currentStep]?.label}
            </div>
          </div>

          {transcript && !steps[currentStep]?.input && (
            <div className="flex items-center justify-between gap-4 bg-[#5a5a5a] px-6 py-3 rounded-xl text-white max-w-md ml-auto mb-6">
              <span className="text-xl">❌</span>
              <span className="text-lg flex-1 text-center">{transcript}</span>
              <span className="text-xl">🎤</span>
            </div>
          )}

          {steps[currentStep]?.input && (
            <input
              type="text"
              value={transcript}
              onChange={handleInputChange}
              className="w-full p-4 rounded-xl bg-[#5a5a5a] text-white text-lg placeholder:text-gray-300 mb-6"
              placeholder="Speak or type your input"
            />
          )}

          <div className="flex gap-6 justify-end">
            {!steps[currentStep]?.input && (
              <button
                onClick={() => handleConfirm("No")}
                className="px-8 py-3 bg-[#2f2f2f] text-white rounded-xl text-lg hover:bg-[#4a4a4a]"
              >
                No
              </button>
            )}
            <button
              onClick={() => handleConfirm(transcript || "Yes")}
              className="px-8 py-3 bg-[#4aff73] text-black rounded-xl text-lg hover:bg-[#44e068]"
            >
              Yes
            </button>
          </div>

          <button
            onClick={startListening}
            className="mt-6 px-6 py-3 text-white text-lg"
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
}