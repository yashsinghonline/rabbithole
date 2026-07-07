import { useEffect, useState } from "react";
import "./GlitchOverlay.css";

export default function GlitchOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(true);

      setTimeout(() => {
        setActive(false);
      }, 3000); // Glitch lasts 3 seconds

    }, 7500); // Every 7.5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!active) return null;

  return (
    <div className="glitch-overlay">
      <div className="glitch-noise"></div>
      <div className="glitch-scanlines"></div>
      <div className="glitch-rgb"></div>
    </div>
  );
}