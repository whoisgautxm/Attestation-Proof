import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Input } from "@nextui-org/input";

const App = () => {
  const placements = ["outside-left"] as const;

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
