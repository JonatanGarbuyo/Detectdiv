import React, { useState } from "react";
import GlobalContentTab from "./components/GlobalContentTab";
import useFusionData from "../hooks/useFusionData";

const DevToolsApp = () => {
	const [activeTab, setActiveTab] = useState("global-content");
	const { data, loading, error, refresh } = useFusionData();

	return (
		<div className="container-fluid">
			{/* Fusion Info Header */}
			<div className="grid fusion-info-header">
				<div>
					<strong>ArcSite:</strong> {data.arcSite || "-"}
				</div>
				<div>
					<strong>Layout:</strong> {data.layout || "-"}
				</div>
				<div>
					<strong>Deployment:</strong> {data.deployment || "-"}
				</div>
				<div>
					<strong>MxID:</strong> {data.mxId || "-"}
				</div>
			</div>

			<div className="tabs">
				<button
					className={`tab-button ${activeTab === "global-content" ? "active" : ""}`}
					onClick={() => setActiveTab("global-content")}
					type="button"
				>
					Global Content
				</button>
			</div>

			<div className="tab-content">
				{activeTab === "global-content" && (
					<GlobalContentTab
						globalContent={data.globalContent}
						loading={loading}
						error={error}
						refresh={refresh}
					/>
				)}
			</div>
		</div>
	);
};

export default DevToolsApp;
