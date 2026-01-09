import React, { useState } from "react";
import JsonView from "@uiw/react-json-view";

const GlobalContentTab = ({ globalContent, loading, error, refresh }) => {
	const [collapsed, setCollapsed] = useState(null); // null (initial) | false (expand all) | true (collapse all)

	return (
		<article>
			<header>
				<hgroup>
					<h2>Global Content</h2>
					<small>Inspect Fusion object</small>
				</hgroup>
			</header>

			<section className="container">
				<button onClick={refresh} disabled={loading} data-tooltip="Refresh" className="outline">
					{loading ? "⏳" : "🔄"}
				</button>
				<button
					onClick={() => setCollapsed(false)}
					disabled={!globalContent}
					data-tooltip="Expand All"
					className="outline secondary"
				>
					➕
				</button>
				<button
					onClick={() => setCollapsed(true)}
					disabled={!globalContent}
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

			{globalContent && (
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
						value={globalContent}
					/>
				</div>
			)}

			{!loading && !error && !globalContent && (
				<p>No global content found. Make sure Fusion() is available on the page.</p>
			)}
		</article>
	);
};

export default GlobalContentTab;
