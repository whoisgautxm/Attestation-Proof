import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccount } from '@wagmi/core';
import { config } from './wagmi';
import { attestation_data } from "./attestation_data";
import { useEthersProvider } from './client_to_provider';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { fetchSchemaRecord } from "./schema_data";
import { ethers } from "ethers";




const App = () => {
  const [uid, setUid] = useState("");
  const [openWidget, setOpenWidget] = useState(false); // State to control widget opening
  const provider = useEthersProvider({ chainId: 11155111 });

  
  const raw_data = "0x0000000000000000000000009f2de3a03c24e5ebd99a478ac93dd2e6772f2f2f0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016072616e646f6d206d656469612075726c0000000000000000000000000000000000000000000000000000000000000000000000000000000000005af3107a400000000000000000000000000000000000000000000000000000000000000000006c41a285b2891172448082fe76fba0444a63353ddfa7ebcba33d941539d1a2d400000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000023416e2061727469636c652061626f7574204f6c6173206f6e203372642041756775737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042697066733a2f2f6261666b7265696673646f376869783268696a637368767a6e6378617a7161757578636b6a7165726e7175726534377163687275353779366b76610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"


  const fetchAttestationData = async (uid) => {
    if (provider) {
      try {
        const attest_data = await attestation_data(uid, provider);
        setOpenWidget(true); // Open the widget after fetching attestation data
        const schemaRecord = await fetchSchemaRecord(provider , attest_data);
        console.log("schemma is " , schemaRecord);

        function parseSchema(schemaRecord) {
          const parts = schemaRecord.split(',').map(part => part.trim());
          const abiTypes = parts.map(part => {
            const [type, name] = part.split(' ').map(p => p.trim());
            return type;
          });
          console.log("abi" , abiTypes);
          return abiTypes;
          
        }
        
        // Function to decode data using the parsed schema
        function decodeData(schemaRecord, raw_data) {
          const abiTypes = parseSchema(schemaRecord);
          return ethers.utils.defaultAbiCoder.decode(abiTypes, raw_data);
        }

      } catch (error) {
        console.error("Error fetching attestation data:", error);
      }
    } else {
      console.error("Provider is not available");
    }
  };



  // Function to verify the proof
  const verifyProof = async (proof) => {
    console.log('proof', proof);
    const response = await fetch(
      'https://developer.worldcoin.org/api/v1/verify/app_staging_129259332fd6f93d4fabaadcc5e4ff9d',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      `Successfully verified with World ID! Your nullifier hash is: ` + result.nullifier_hash
    );
    setOpenWidget(false); // Close the widget after success
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
  );
};

export default App;
