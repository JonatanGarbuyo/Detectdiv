import React, { useState } from "react";

const ConfigView = ({ outputTypes, onAddOutputType, onDeleteOutputType }) => {
  const [newOutputType, setNewOutputType] = useState("");

  const handleAdd = () => {
    onAddOutputType(newOutputType);
    setNewOutputType("");
  };

  return (
    <div className="tab-content">
      <div className="">
        <h2 className="">Output Types</h2>
        {outputTypes.map((type) => (
          <fieldset className="grid" key={type} role="group">
            <input className="" disabled value={type} />
            <button
              className=""
              type="button"
              onClick={() => onDeleteOutputType(type)}
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
                handleAdd();
              }
            }}
          />
          <button
            className=""
            type="button"
            onClick={handleAdd}
            aria-label="Add output type"
          >
            +
          </button>
        </fieldset>
      </div>
    </div>
  );
};

export default ConfigView;
