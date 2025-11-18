import { useState, useEffect, useCallback } from "react";
import {
  sendMessage,
  getActiveTab,
  getTab,
  updateTab,
  getStorageLocal,
  setStorageLocal,
} from "../utils/chrome";

export const useExtensionData = () => {
  const [deploymentNumber, setDeploymentNumber] = useState("");
  const [currentTabId, setCurrentTabId] = useState(null);
  const [outputTypes, setOutputTypes] = useState(["amp-type"]);
  const [selectedOutputType, setSelectedOutputType] = useState("");

  const updateUrlParam = useCallback(async (tabId, param, value) => {
    const tab = await getTab(tabId);
    if (tab?.url) {
      try {
        const url = new URL(tab.url);
        if (!url.protocol.startsWith("http")) {
          return;
        }

        url.searchParams.delete(param);
        if (value && value.trim() !== "") {
          url.searchParams.set(param, value);
        }

        await updateTab(tabId, { url: url.toString() });
      } catch (error) {
        console.error("Error updating URL:", error);
      }
    }
  }, []);

  const saveDeployment = useCallback(
    async (tabId, deployment) => {
      const response = await sendMessage({
        action: "saveDeployment",
        tabId: tabId,
        deployment: deployment,
      });

      if (response?.success) {
        updateUrlParam(tabId, "d", deployment);
      }
    },
    [updateUrlParam]
  );

  const saveOutputType = useCallback(
    async (tabId, outputType) => {
      const response = await sendMessage({
        action: "saveOutputType",
        tabId: tabId,
        outputType: outputType,
      });

      if (response?.success) {
        updateUrlParam(tabId, "outputType", outputType);
      }
    },
    [updateUrlParam]
  );

  useEffect(() => {
    const init = async () => {
      const tab = await getActiveTab();
      if (tab?.id) {
        const tabId = tab.id;
        setCurrentTabId(tabId);

        // Load saved deployment number
        const deploymentResponse = await sendMessage({
          action: "getDeployment",
          tabId: tabId,
        });

        if (deploymentResponse?.deployment) {
          setDeploymentNumber(deploymentResponse.deployment);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingDeployment = url.searchParams.get("d");
            if (existingDeployment) {
              setDeploymentNumber(existingDeployment);
              saveDeployment(tabId, existingDeployment);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
        }

        // Load saved outputTypes
        const storageResult = await getStorageLocal(["outputTypes"]);
        if (
          storageResult.outputTypes &&
          Array.isArray(storageResult.outputTypes) &&
          storageResult.outputTypes.length > 0
        ) {
          setOutputTypes(storageResult.outputTypes);
        } else {
          const defaultTypes = ["amp-type"];
          setOutputTypes(defaultTypes);
          setStorageLocal({ outputTypes: defaultTypes });
        }

        // Load saved outputType for this tab
        const outputTypeResponse = await sendMessage({
          action: "getOutputType",
          tabId: tabId,
        });

        if (outputTypeResponse?.outputType) {
          setSelectedOutputType(outputTypeResponse.outputType);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingOutputType = url.searchParams.get("outputType");
            if (existingOutputType) {
              setSelectedOutputType(existingOutputType);
              saveOutputType(tabId, existingOutputType);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
        }
      }
    };

    init();
  }, [saveDeployment, saveOutputType]);

  const handleDeploymentChange = (value) => {
    setDeploymentNumber(value);
    if (currentTabId !== null) {
      saveDeployment(currentTabId, value);
    }
  };

  const handleOutputTypeChange = (value) => {
    setSelectedOutputType(value);
    if (currentTabId !== null) {
      saveOutputType(currentTabId, value);
    }
  };

  const addOutputType = (newType) => {
    const trimmedValue = newType.trim();
    if (trimmedValue && !outputTypes.includes(trimmedValue)) {
      const updatedTypes = [...outputTypes, trimmedValue];
      setOutputTypes(updatedTypes);
      setStorageLocal({ outputTypes: updatedTypes });
    }
  };

  const deleteOutputType = (typeToDelete) => {
    if (outputTypes.length <= 1) return;

    const updatedTypes = outputTypes.filter((type) => type !== typeToDelete);
    setOutputTypes(updatedTypes);

    if (selectedOutputType === typeToDelete && currentTabId !== null) {
      setSelectedOutputType("");
      saveOutputType(currentTabId, "");
    }

    setStorageLocal({ outputTypes: updatedTypes });
  };

  const clearAll = async () => {
    setDeploymentNumber("");
    setSelectedOutputType("");
    if (currentTabId !== null) {
      await sendMessage({
        action: "saveDeployment",
        tabId: currentTabId,
        deployment: "",
      });
      await sendMessage({
        action: "saveOutputType",
        tabId: currentTabId,
        outputType: "",
      });
      
      const tab = await getTab(currentTabId);
      if (tab?.url) {
        try {
            const url = new URL(tab.url);
            if (!url.protocol.startsWith("http")) return;
            
            url.searchParams.delete("d");
            url.searchParams.delete("outputType");
            
            await updateTab(currentTabId, { url: url.toString() });
        } catch (error) {
            console.error("Error updating URL:", error);
        }
      }
    }
  };

  return {
    deploymentNumber,
    outputTypes,
    selectedOutputType,
    handleDeploymentChange,
    handleOutputTypeChange,
    addOutputType,
    deleteOutputType,
    clearAll,
  };
};
