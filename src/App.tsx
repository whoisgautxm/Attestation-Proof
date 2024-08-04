import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccount } from '@wagmi/core';
import { config } from './wagmi';
import { attestation_data } from "./attestation_data";
import { useEthersProvider } from './client_to_provider';

const App = () => {
  const [uid, setUid] = useState("");
  const provider = useEthersProvider({ chainId: 11155111 });

  const fetchAttestationData = async (uid:string) => {
    if (provider) {
      try {
        await attestation_data(uid, provider);
      } catch (error) {
        console.error("Error fetching attestation data:", error);
      }
    } else {
      console.error("Provider is not available");
    }
  };

  return (
    <div className="main-app">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 12,
        }}
      >
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
          <button onClick={() => fetchAttestationData(uid)}>Generate ZK Proof</button>
        </div>
      </div>
    </div>
  );
};

export default App;
