import {
  EAS
} from "@ethereum-attestation-service/eas-sdk";

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

export const attestation_data = async (uid, provider) => {
  const eas = new EAS(EASContractAddress);
  await eas.connect(provider);

  const attestation = await eas.getAttestation(uid);

  const schemaUID = attestation.schema;
  const attest_data = attestation.data;
  const recipient = attestation.recipient;
  const attester = attestation.attester;

//   console.log(attestation);

  return {schemaUID, attest_data, recipient, attester};
};
