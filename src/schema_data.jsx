import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";

import { attestation_data } from "./attestation_data";

const schemaRegistryContractAddress =
  "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26

export const fetchSchemaRecord = async (provider, attestation_data) => {
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
  await schemaRegistry.connect(provider);
  
  const schemaRecord = await schemaRegistry.getSchema({ uid: attestation_data});
  console.log(schemaRecord);
  return schemaRecord[3]
};

// Example usage
// fetchSchemaRecord(provider, "0xYourSchemaUID");