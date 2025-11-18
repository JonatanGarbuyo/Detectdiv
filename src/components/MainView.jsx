import React from "react";

const MainView = ({
	deploymentNumber,
	outputTypes,
	selectedOutputType,
	onDeploymentChange,
	onOutputTypeChange,
	onClear,
}) => {
	return (
		<div className="tab-content">
			<label className="" htmlFor="deployment">
				Deployment number
				<input
					className=""
					type="number"
					name="deployment"
					id="deployment"
					value={deploymentNumber}
					onChange={(e) => onDeploymentChange(e.target.value)}
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
					onChange={(e) => onOutputTypeChange(e.target.value)}
				>
					<option value=""> - </option>
					{outputTypes.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</label>

			<input onClick={onClear} type="submit" className="" value="Clear all" />
		</div>
	);
};

export default MainView;
