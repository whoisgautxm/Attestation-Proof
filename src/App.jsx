import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { attestation_data } from "./attestation_data";
import { useEthersProvider } from "./client_to_provider";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { fetchSchemaRecord } from "./schema_data";
import { ethers, AbiCoder, getBytes } from "ethers";
import Loader from "./components/loader/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "./assets/zka_logo.svg";
import { useVerify } from "./action/verify";

const App = () => {
  const [uid, setUid] = useState("");
  const [openWidget, setOpenWidget] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDataFetching, setIsDataFetching] = useState(false);
  const provider = useEthersProvider({ chainId: 11155111 });
  const { address, isConnected } = useAccount();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { verify, verificationResult, loading, error } = useVerify();
  const [isVerified, setIsVerified] = useState(false); // Fixed typo here
  const [zkpMessage, setZkpMessage] = useState("");

  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

  const handleProof = async (result) => {
    console.log(
      "Proof received from IDKit, sending to backend:\n",
      JSON.stringify(result)
    );

    try {
      const response = await fetch("http://localhost:3001/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Verification failed: ${errorData.message}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(
          "Successful response from backend:\n",
          JSON.stringify(data)
        );
        onSuccess(); // Call onSuccess without arguments
      } else {
        throw new Error(
          "Verification failed: Backend response was not successful."
        );
      }
    } catch (error) {
      console.error("Error during proof verification:", error);
      setErrorMessage("Proof verification failed. Please try again.");
    }
  };

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
    const coder = new AbiCoder();
    const bytes = getBytes(raw_data);
    console.log("bytes is", bytes);
    const decodedResult = coder.decode(
      abiTypes.map((item) => item.type),
      bytes
    );

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

  const fetchAttestationData = async (uid) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    console.log("uid", uid);
    console.log("account", address);
    if (provider) {
      try {
        const { schemaUID, attest_data, recipient, attester } =
          await attestation_data(uid, provider);

        if (address === attester || address === recipient) {
          if (!isVerified) {
            setOpenWidget(true); // Open the widget after fetching attestation data
          } else {
            const schemaRecord = await fetchSchemaRecord(provider, schemaUID);
            console.log("schema is ", schemaRecord);
            const abiTypes = parseSchema(schemaRecord);
            const decodedData = decodeData(abiTypes, attest_data);
            saveJSON(decodedData);
            setIsDataFetching(true);

            // Fetch the ZKP result from the backend
            const response = await fetch("http://localhost:3001/save-json", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(decodedData),
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const result = await response.json();
            console.log("ZKP result:", result);

            // Extract digest and fields
            const { digest, fields } = result;
            console.log("Digest:", digest);
            console.log("Fields:", fields);

            // Set the message and stop the loader
            setZkpMessage(
              `ZK proof is generated with Digest: ${digest} and it provably contains the data fields: ${JSON.stringify(
                fields
              )}`
            );
            setIsDataFetching(false);
          }
        } else {
          toast.error(
            "You are not the attester or recipient of this attestation"
          );
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

  const onSuccess = () => {
    console.log("Proof verified successfully");
    setIsVerified(true); // Fixed this to correctly set the state
    fetchAttestationData(uid);
    setOpenWidget(false); // Close the widget after successful verification
  };

  const handleGenerateZKP = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    // Attempt to fetch attestation data; the WorldCoin widget will open if conditions are met
    fetchAttestationData(uid);
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

          {error && <div className="error-message">{error}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          

          <div className="submit-uid">
            <button onClick={handleGenerateZKP}>Generate ZK Proof</button>
          </div>
        </div>

        {zkpMessage && <div className="zkp-message">{zkpMessage}</div>}
        
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {isDataFetching && <Loader />}

        {openWidget && (
          <IDKitWidget
            app_id="app_staging_79bf4c6cc4665f623a18b40b1a4bc286"
            action="gautam"
            verification_level={VerificationLevel.Device}
            handleVerify={handleProof}
            onSuccess={onSuccess}
            onError={(error) => {
              console.error("WorldCoin verification error:", error);
              setErrorMessage("WorldCoin verification failed.");
              setOpenWidget(false); // Close the widget on error
            }}
          >
            {({ open }) => (
              <button
                onClick={open}
                style={{ display: "none" }}
                ref={(button) => button && button.click()}
              >
                Verify with World ID
              </button>
            )}
          </IDKitWidget>
        )}

        {loading && <Loader />}

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