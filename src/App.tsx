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

      <div className='heading'>
        <h1>Create ZKPs of Attestations</h1>
      </div>

    <div className='input'>

    <div className='input-uid'>
    <label>Enter UID:</label>
    <input type="text" id="fname" name="fname" placeholder='UID'/>
    </div>

    <div className='submit-uid'>
    <button>
      Create Proof
    </button>
    </div>
    </div> 




    </div>
 

    
  );
};

export default App;