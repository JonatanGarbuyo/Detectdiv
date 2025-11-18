import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
	const [activeTab, setActiveTab] = useState("main");
	const [deploymentNumber, setDeploymentNumber] = useState("");
	const [currentTabId, setCurrentTabId] = useState(null);
	const [outputTypes, setOutputTypes] = useState(["amp-type"]);
	const [selectedOutputType, setSelectedOutputType] = useState("");
	const [newOutputType, setNewOutputType] = useState("");

	const saveDeployment = useCallback((tabId, deployment) => {
		chrome.runtime.sendMessage(
			{
				action: "saveDeployment",
				tabId: tabId,
				deployment: deployment,
			},
			(response) => {
				if (response?.success) {
					// Update current URL immediately if tab is available
					chrome.tabs.get(tabId, (tab) => {
						if (tab?.url) {
							try {
								const url = new URL(tab.url);
								if (!url.protocol.startsWith("http")) {
									return;
								}

								url.searchParams.delete("d");
								if (deployment && deployment.trim() !== "") {
									url.searchParams.set("d", deployment);
								}

								chrome.tabs.update(tabId, { url: url.toString() });
							} catch (error) {
								console.error("Error updating URL:", error);
							}
						}
					});
				}
			}
		);
	}, []);

	const saveOutputType = useCallback((tabId, outputType) => {
		chrome.runtime.sendMessage(
			{
				action: "saveOutputType",
				tabId: tabId,
				outputType: outputType,
			},
			(response) => {
				if (response?.success) {
					// Update current URL immediately if tab is available
					chrome.tabs.get(tabId, (tab) => {
						if (tab?.url) {
							try {
								const url = new URL(tab.url);
								if (!url.protocol.startsWith("http")) {
									return;
								}

								url.searchParams.delete("outputType");
								if (outputType && outputType.trim() !== "") {
									url.searchParams.set("outputType", outputType);
								}

								chrome.tabs.update(tabId, { url: url.toString() });
							} catch (error) {
								console.error("Error updating URL:", error);
							}
						}
					});
				}
			}
		);
	}, []);

	useEffect(() => {
		// Get the active tab and load saved deployment number
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				const tabId = tabs[0].id;
				setCurrentTabId(tabId);

				// Load saved deployment number for this tab
				chrome.runtime.sendMessage({ action: "getDeployment", tabId: tabId }, (response) => {
					if (response?.deployment) {
						setDeploymentNumber(response.deployment);
					} else {
						// If no saved value, check current URL
						if (tabs[0]?.url) {
							try {
								const url = new URL(tabs[0].url);
								const existingDeployment = url.searchParams.get("d");
								if (existingDeployment) {
									setDeploymentNumber(existingDeployment);
									// Save it for future navigations
									saveDeployment(tabId, existingDeployment);
								}
							} catch (error) {
								console.error("Error parsing URL:", error);
							}
						}
					}
				});

				// Load saved outputTypes list (global configuration)
				chrome.storage.local.get(["outputTypes"], (result) => {
					if (
						result.outputTypes &&
						Array.isArray(result.outputTypes) &&
						result.outputTypes.length > 0
					) {
						setOutputTypes(result.outputTypes);
					} else {
						// Initialize with default if none exists
						const defaultTypes = ["amp-type"];
						setOutputTypes(defaultTypes);
						chrome.storage.local.set({ outputTypes: defaultTypes });
					}
				});

				// Load saved outputType for this tab
				chrome.runtime.sendMessage({ action: "getOutputType", tabId: tabId }, (response) => {
					if (response?.outputType) {
						setSelectedOutputType(response.outputType);
					} else {
						// If no saved value, check current URL
						if (tabs[0]?.url) {
							try {
								const url = new URL(tabs[0].url);
								const existingOutputType = url.searchParams.get("outputType");
								if (existingOutputType) {
									setSelectedOutputType(existingOutputType);
									// Save it for future navigations
									saveOutputType(tabId, existingOutputType);
								}
							} catch (error) {
								console.error("Error parsing URL:", error);
							}
						}
					}
				});
			}
		});
	}, [saveDeployment, saveOutputType]);

	const handleDeploymentChange = (e) => {
		const value = e.target.value;
		setDeploymentNumber(value);

		if (currentTabId !== null) {
			saveDeployment(currentTabId, value);
		}
	};

	const handleOutputTypeChange = (e) => {
		const value = e.target.value;
		setSelectedOutputType(value);

		if (currentTabId !== null) {
			saveOutputType(currentTabId, value);
		}
	};

	const handleAddOutputType = () => {
		const trimmedValue = newOutputType.trim();
		if (trimmedValue && !outputTypes.includes(trimmedValue)) {
			const updatedTypes = [...outputTypes, trimmedValue];
			setOutputTypes(updatedTypes);
			setNewOutputType("");
			// Save the updated list globally
			chrome.storage.local.set({ outputTypes: updatedTypes }, () => {
				console.log("OutputTypes list updated");
			});
		}
	};

	const handleDeleteOutputType = (typeToDelete) => {
		// Don't allow deleting if it's the only one
		if (outputTypes.length <= 1) {
			return;
		}

		const updatedTypes = outputTypes.filter((type) => type !== typeToDelete);
		setOutputTypes(updatedTypes);

		// If the deleted type was selected, clear the selection
		if (selectedOutputType === typeToDelete && currentTabId !== null) {
			setSelectedOutputType("");
			saveOutputType(currentTabId, "");
		}

		// Save the updated list globally
		chrome.storage.local.set({ outputTypes: updatedTypes }, () => {
			console.log("OutputTypes list updated");
		});
	};

	const handleClear = () => {
		setDeploymentNumber("");
		setSelectedOutputType("");
		if (currentTabId !== null) {
			const tabId = currentTabId;

			// Clear both values in storage first
			chrome.runtime.sendMessage(
				{
					action: "saveDeployment",
					tabId: tabId,
					deployment: "",
				},
				() => {
					chrome.runtime.sendMessage(
						{
							action: "saveOutputType",
							tabId: tabId,
							outputType: "",
						},
						() => {
							// Update URL once with both parameters removed
							chrome.tabs.get(tabId, (tab) => {
								if (tab?.url) {
									try {
										const url = new URL(tab.url);
										if (!url.protocol.startsWith("http")) {
											return;
										}

										// Remove both parameters in a single update
										url.searchParams.delete("d");
										url.searchParams.delete("outputType");

										chrome.tabs.update(tabId, { url: url.toString() });
									} catch (error) {
										console.error("Error updating URL:", error);
									}
								}
							});
						}
					);
				}
			);
		}
	};

	return (
		<>
			<h1 className="main__title">Detectdiv</h1>

			<div className="tabs">
				<button
					className={`tab-button ${activeTab === "main" ? "active" : ""}`}
					onClick={() => setActiveTab("main")}
					type="button"
				>
					Main
				</button>
				<button
					className={`tab-button ${activeTab === "config" ? "active" : ""}`}
					onClick={() => setActiveTab("config")}
					type="button"
				>
					Config
				</button>
			</div>

			{activeTab === "main" && (
				<div className="tab-content">
					<label className="" htmlFor="deployment">
						Deployment number
						<input
							className=""
							type="number"
							name="deployment"
							id="deployment"
							value={deploymentNumber}
							onChange={handleDeploymentChange}
							placeholder="123"
						/>
					</label>

					<label className="" htmlFor="outputType">
						Output Type
						<select
							className=""
							name="outputType"
							id="outputType"
							value={selectedOutputType}
							onChange={handleOutputTypeChange}
						>
							<option value=""> - </option>
							{outputTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</label>

					<input onClick={handleClear} type="submit" className="" value="Clear all" />
				</div>
			)}

			{activeTab === "config" && (
				<div className="tab-content">
					<div className="">
						<h2 className="">Output Types</h2>
						{outputTypes.map((type) => (
							<fieldset className="grid" key={type} role="group">
								<input className="" disabled value={type} />
								<button
									className=""
									type="button"
									onClick={() => handleDeleteOutputType(type)}
									aria-label={`Delete ${type}`}
									disabled={outputTypes.length <= 1}
								>
									–
								</button>
							</fieldset>
						))}
					</div>

					<div className="">
						<fieldset className="grid" role="group">
							<input
								className=""
								type="text"
								name="newOutputType"
								id="newOutputType"
								value={newOutputType}
								onChange={(e) => setNewOutputType(e.target.value)}
								placeholder="Add Output Type"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										handleAddOutputType();
									}
								}}
							/>
							<button
								className=""
								type="button"
								onClick={handleAddOutputType}
								aria-label="Add output type"
							>
								+
							</button>
						</fieldset>
					</div>
				</div>
			)}
		</>
	);
}

export default App;
