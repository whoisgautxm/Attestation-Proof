import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAttestationByUID } from './attestation_data';
import { getAccount } from '@wagmi/core'
import { config } from './wagmi'

const App = () => {
  const placements = [
    "outside-left",
  ] as const;

  const fetchAttestationData = async () => {
    try {
      const response = await fetch('https://easscan.org/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query Attestation {
            attestation(
              where: { id: "0xa4fb0ad1e13efbb38e466af0cb59822cae7f9ea26f26dd34ddb09c76ee9dbb12" }
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
      console.log(data);
      const account = getAccount(config)
      console.log(account)
    } catch (error) {
      console.error('Error fetching attestation data:', error);
    }
  };

  return (
    <div className="main-app">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
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

          <input type="text" id="fname" name="fname" placeholder="UID" />
        </div>

        <div className="submit-uid">
          <button>Generate ZK Proof</button>
        </div>
      </div>
    </div>
  );
};

export default App;
