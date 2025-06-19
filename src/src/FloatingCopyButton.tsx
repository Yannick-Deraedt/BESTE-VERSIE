import React from "react";
import ReactDOM from "react-dom";

type Props = {
  onClick: () => void;
  success: boolean;
};

const buttonStyle: React.CSSProperties = {
  position: "fixed",
  right: 24,
  bottom: 24,
  width: 64,
  height: 64,
  borderRadius: 9999,
  background: "rgba(240,245,255,0.7)",
  boxShadow: "0 8px 32px 0 rgba(80,140,255,0.15)",
  border: "1.5px solid rgba(255,255,255,0.29)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
  cursor: "pointer",
  transition: "background 0.18s, box-shadow 0.2s",
};

const FloatingCopyButton: React.FC<Props> = ({ onClick, success }) => {
  return ReactDOM.createPortal(
    <button
      onClick={onClick}
      style={{
        ...buttonStyle,
        background: success ? "rgba(120,180,255,0.78)" : buttonStyle.background,
        boxShadow: success
          ? "0 8px 40px 0 rgba(80,180,255,0.23), 0 0 0 3px rgba(120,180,255,0.19)"
          : buttonStyle.boxShadow,
        border: success ? "2px solid #4ec5fc" : buttonStyle.border,
      }}
      aria-label="Kopieer e-mail"
    >
      <span style={{ fontSize: "2.1rem", color: "#118b37", textShadow: "0 2px 12px #fff9" }}>📋</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, marginTop: 3, color: "#1865b5", textShadow: "0 1px 4px #fff8" }}>Kopieer</span>
      {success && (
        <span style={{
          position: "absolute",
          top: 6,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#2196f3",
          fontWeight: 800,
          fontSize: "1.1rem",
          filter: "drop-shadow(0 1px 3px #fff8)"
        }}>✔️</span>
      )}
    </button>,
    document.body
  );
};

export default FloatingCopyButton;
