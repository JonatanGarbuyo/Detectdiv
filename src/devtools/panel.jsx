import React from "react";
import ReactDOM from "react-dom/client";
import DevToolsApp from "./DevToolsApp.jsx";
import "../App.css";

// Polyfill for navigator.clipboard.writeText using execCommand to avoid Permissions Policy issues in DevTools
if (navigator.clipboard) {
	navigator.clipboard.writeText = async (text) => {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-9999px";
		textArea.style.top = "0";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand("copy");
		} catch (err) {
			console.error("ExecCommand copy failed:", err);
		} finally {
			document.body.removeChild(textArea);
		}
	};
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<DevToolsApp />
	</React.StrictMode>
);
