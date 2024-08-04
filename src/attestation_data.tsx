import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

export const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26

// Function to get attestation by UID
export const getAttestationByUID = async (uid: string) => {
  // Initialize the sdk with the address of the EAS Schema contract address
  const eas = new EAS(EASContractAddress);

  // Create a wallet instance (replace with your private key)


  // Connects a signer to perform read/write functions.

  // Fetch the attestation
  const attestation = await eas.getAttestation(uid);

  console.log(attestation);
};