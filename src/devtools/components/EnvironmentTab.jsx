import React, { useState } from "react";
import JsonView from "@uiw/react-json-view";

const EnvironmentTab = ({ environment, loading, error, refresh }) => {
	const [collapsed, setCollapsed] = useState(2);

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
						value={environment}
						collapsed={collapsed}
						displayDataTypes={false}
						enableClipboard={true}
						style={{ backgroundColor: "transparent" }}
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
