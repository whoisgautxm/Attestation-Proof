import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'; // Import useAccount hook
import { attestation_data } from "./attestation_data";
import { useEthersProvider } from "./client_to_provider";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { fetchSchemaRecord } from "./schema_data";
import { ethers, AbiCoder, getBytes } from "ethers";
import Loader from "./components/loader/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from "./assets/zka_logo.svg";

const App = () => {
  const [uid, setUid] = useState(""); // State to store UID
  const [openWidget, setOpenWidget] = useState(false); // State to control widget opening
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages
  const [isDataFetching, setIsDataFetching] = useState(false); // State to control loader visibility
  const provider = useEthersProvider({ chainId: 11155111 }); // Get the provider
  const { address, isConnected } = useAccount(); // Use useAccount hook to get the account and connection status
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

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
    const decodedResult = coder.decode(
      abiTypes.map((item) => item.type),
      bytes
    ); // Decode the data

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

  // Function to save JSON data to the server
  const saveJSON = (data) => {
    fetch("http://localhost:3001/save-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => {
        console.log(text);
      })
      .catch((error) => {
        console.error("Error saving JSON data:", error);
      });
  };

  // Function to fetch attestation data
  const fetchAttestationData = async (uid) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    console.log("uid", uid);
    console.log("account", address);
    if (provider) {
      try {
        const { schemaUID, attest_data, recipient, attester } = await attestation_data(uid, provider);

        // if (address === attester || address === recipient) {
        if (true) {
          setOpenWidget(true); // Open the widget after fetching attestation data
          const schemaRecord = await fetchSchemaRecord(provider, schemaUID);
          console.log("schema is ", schemaRecord);
          const abiTypes = parseSchema(schemaRecord);
          const decodedData = decodeData(abiTypes, attest_data);
          saveJSON(decodedData); // Save formatted result as JSON to the server
          setIsDataFetching(true); // Show loader permanently after the first request
        } else {
          toast.error("You are not the attester or recipient of this attestation");
        }
      } catch (error) {
        console.error("Error fetching attestation data:", error);
        toast.error("Please enter a valid UID");
      }
    } else {
      console.error("Provider is not available");
      toast.error("Provider is not available");
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
        <div className="navbar">
          <div className="logo-container">
            <img src={Logo} alt="ZKA Logo" />
          </div>
          <div className="connect-button">
            <ConnectButton />
          </div>
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
            <button
              onClick={() => fetchAttestationData(uid)}
            >
              Generate ZK Proof
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Loader should be visible permanently after the first request */}
        {isDataFetching && <Loader />}

        {/* 
        {openWidget && (
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
        )} 
        */}

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default App;
