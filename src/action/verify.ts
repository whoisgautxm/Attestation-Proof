import { useState } from "react";
import { VerificationLevel } from "@worldcoin/idkit-core";
import { verifyCloudProof } from "@worldcoin/idkit-core/backend";

export type VerifyReply = {
  success: boolean;
  code?: string;
  attribute?: string | null;
  detail?: string;
};

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
  signal?: string;
}

const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
const action = process.env.NEXT_PUBLIC_WLD_ACTION as string;

export function useVerify() {
  const [verificationResult, setVerificationResult] = useState<VerifyReply | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (proof: IVerifyRequest["proof"], signal?: string) => {
    setLoading(true);
    setError(null);

    try {
      const verifyRes = await verifyCloudProof(proof, app_id, action, signal);
      if (verifyRes.success) {
        setVerificationResult({ success: true });
      } else {
        setVerificationResult({
          success: false,
          code: verifyRes.code,
          attribute: verifyRes.attribute,
          detail: verifyRes.detail,
        });
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { verify, verificationResult, loading, error };
}