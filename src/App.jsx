import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccount } from "@wagmi/core";
import { config } from "./wagmi";
import { attestation_data } from "./attestation_data";
import { useEthersProvider } from "./client_to_provider";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { fetchSchemaRecord } from "./schema_data";
import { ethers, AbiCoder, getBytes } from "ethers";
import { saveAs } from "file-saver"; // Import file-saver

const App = () => {
  const [uid, setUid] = useState(""); // State to store UID
  const [openWidget, setOpenWidget] = useState(false); // State to control widget opening
  const provider = useEthersProvider({ chainId: 11155111 }); // Get the provider

  // ================== Functions ==================

  function parseSchema(schemaRecord) {
    const parts = schemaRecord.split(",").map((part) => part.trim());
    const abiTypes = parts.map((part) => {
      const [type, name] = part.split(" ").map((p) => p.trim());
      return { type, name };
    });
    console.log("abi", abiTypes);
    return abiTypes;
  }

  function decodeData(abiTypes, raw_data) {
    const coder = new AbiCoder(); // Create a new AbiCoder instance
    const bytes = getBytes(raw_data); // Convert the raw data to bytes
    console.log("bytes is", bytes); // Print the bytes
    const decodedResult = coder.decode(abiTypes.map(item => item.type), bytes); // Decode the data

    // Map the schema field names to the decoded data
    const formattedResult = abiTypes.reduce((acc, { name }, index) => {
      acc[name] = decodedResult[index];
      if (typeof acc[name] === "bigint") {
        acc[name] = acc[name].toString();
      } else if (acc[name] instanceof Uint8Array) {
        acc[name] = ethers.hexlify(acc[name]);
      } else if (Array.isArray(acc[name])) {
        acc[name] = acc[name].map((subItem) =>
          typeof subItem === "bigint" ? subItem.toString() : subItem
        );
      } else {
        acc[name] = acc[name].toString();
      }
      return acc;
    }, {});

    console.log("Decoded Data:", formattedResult);
    return formattedResult;
  }


  // Function to save JSON data
  const saveJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, "formattedResult.json");
  };

  // Function to fetch attestation data
  const fetchAttestationData = async (uid) => {
    if (provider) {
      try {
        const { schemaUID, attest_data } = await attestation_data(uid, provider);
        setOpenWidget(true); // Open the widget after fetching attestation data
        const schemaRecord = await fetchSchemaRecord(provider, schemaUID);
        console.log("schema is ", schemaRecord);
        const abiTypes = parseSchema(schemaRecord);
        const decodedData = decodeData(abiTypes, attest_data);
        saveJSON(decodedData); // Save formatted result as JSON
      } catch (error) {
        console.error("Error fetching attestation data:", error);
      }
    } else {
      console.error("Provider is not available");
    }
  };

  // Function to verify the WorldCoin ID
  const verifyProof = async (proof) => {
    console.log("proof", proof);
    const response = await fetch(
      "https://developer.worldcoin.org/api/v1/verify/app_staging_129259332fd6f93d4fabaadcc5e4ff9d",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...proof, action: "test" }),
      }
    );
    if (response.ok) {
      const { verified } = await response.json();
      return verified;
    } else {
      const { code, detail } = await response.json();
      throw new Error(`Error Code ${code}: ${detail}`);
    }
  };

  // Functionality after verifying
  const onSuccess = (result) => {
    window.alert(
      `Successfully verified with World ID! Your nullifier hash is: ` +
        result.nullifier_hash
    );
    setOpenWidget(false); // Close the widget after success
  };

  return (
    <div className="grid-background">
      <div className="gradient-overlay"></div>
    <div className="main-app">
      <div className="connect-button">
        <ConnectButton />
      </div>

      <div className="heading">
        <h1>Create ZKPs of Attestations</h1>
      </div>

      <div className="zkp-container">
        <div className="input-container">
          <div className="input-uid-text">
            <label>Enter UID:</label>
          </div>

          <input
            type="text"
            id="fname"
            name="fname"
            placeholder="UID"
            onChange={(e) => setUid(e.target.value)}
          />
        </div>

        <div className="submit-uid">
          <button onClick={() => fetchAttestationData(uid)}>
            Generate ZK Proof
          </button>
        </div>
      </div>

      {/* {openWidget && (
        <IDKitWidget
          app_id="app_staging_79bf4c6cc4665f623a18b40b1a4bc286"
          action="gautam"
          verification_level={VerificationLevel.Device}
          handleVerify={verifyProof}
          onSuccess={onSuccess}
        >
          {({ open }) => (
            <button onClick={open} style={{ display: 'none' }} ref={(button) => button && button.click()}>
              Verify with World ID
            </button>
          )}
        </IDKitWidget>
      )} */}
    </div>
    </div>
  );
};

export default App;
