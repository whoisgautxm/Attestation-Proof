import { ConnectButton } from '@rainbow-me/rainbowkit';
import {Input} from "@nextui-org/input";


const App = () => {

  const placements = [
    "outside-left",
  ] as const;

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

    <div>

    <label>First name:</label>
    <input type="text" id="fname" name="fname" />
    </div> 
    </div>
 

    
  );
};

export default App;