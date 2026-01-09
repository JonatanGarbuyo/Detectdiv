import React, { useState } from "react";
import JsonView from "@uiw/react-json-view";

const EnvironmentTab = ({ environment, loading, error, refresh }) => {
	const [collapsed, setCollapsed] = useState(null); // null (initial) | false (expand all) | true (collapse all)

	return (
		<article>
			<header>
				<hgroup>
					<h2>Environment</h2>
					<small>Inspect Fusion environment variables</small>
				</hgroup>
			</header>

			<section className="container">
				<button onClick={refresh} disabled={loading} data-tooltip="Refresh" className="outline">
					{loading ? "⏳" : "🔄"}
				</button>
				<button
					onClick={() => setCollapsed(false)}
					disabled={!environment}
					data-tooltip="Expand All"
					className="outline secondary"
				>
					➕
				</button>
				<button
					onClick={() => setCollapsed(true)}
					disabled={!environment}
					data-tooltip="Collapse All"
					className="outline secondary"
				>
					➖
				</button>
			</section>

			{error && (
				<article aria-label="Error" className="pico-background-red-100">
					{error}
				</article>
			)}

			{environment && (
				<div style={{ overflow: "auto" }}>
					<JsonView
						collapsed={collapsed === true}
						displayDataTypes={false}
						enableClipboard={true}
						style={{ backgroundColor: "transparent" }}
						shouldExpandNodeInitially={(isExpanded, { level }) => {
							if (collapsed === false) return true;
							if (collapsed === true) return false;
							return level <= 1;
						}}
						value={environment}
					/>
				</div>
			)}

			{!loading && !error && !environment && (
				<p>No environment data found. Make sure Fusion() is available on the page.</p>
			)}
		</article>
	);
};

export default EnvironmentTab;
