import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';

import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
export const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26

// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

const client = createPublicClient({ 
    chain: sepolia, 
    transport: http(),
})


eas.connect(client);

const uid = '0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e';

const attestation = await eas.getAttestation(uid);

console.log(attestation);