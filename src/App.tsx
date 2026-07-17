import {  Route, Routes } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import LoadingScreen from "./components/LoadingScreen";
import GlitchOverlay from "./components/GlitchOverlay"; // <-- Add this

import { depthStore } from "./state/depthStore";

export default function App() {
  const [introDone, setIntroDone] = useState(depthStore.introSeen);

  if (!introDone) {
    return (
      <LoadingScreen
        onDone={() => {
          depthStore.introSeen = true;
          setIntroDone(true);
        }}
      />
    );
  }

  return (
    <>
      {/* Global Glitch Effect */}
      <GlitchOverlay />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
    </>
  );
}
