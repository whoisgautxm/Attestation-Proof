import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccount } from '@wagmi/core';
import { config } from './wagmi';
import { useState } from "react";


 


const App = () => {
  const [uid, setUid] = useState("");

  const fetchAttestationData = async () => {
    try {
      console.log("UID:", uid); // Ensure UID is being logged correctly
      const response = await fetch('https://easscan.org/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query Attestation {
            attestation(/
              where: { id: "${uid}" }
            ) {
              id
              attester
              recipient
              refUID
              revocable
              revocationTime
              expirationTime
              data
            }
          }`,
          variables: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Attestation Data:", data); // Log the fetched data

      const account = getAccount(config);
      console.log("Account Data:", account); // Log the account data
    } catch (error) {
      console.error('Error fetching attestation data:', error);
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
          <button onClick={() => fetchAttestationData()}>Generate ZK Proof</button>
        </div>
      </div>
    </div>
  );
};

export default App;
