/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { redirectToTelegram } from "@/helpers/redirectToTelegram";

const VerifySignaturePage: FC = () => {
  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const data = searchParams.get("data");
  const userId = searchParams.get("userId");
  const tgWebAppData = searchParams.get("tgWebAppData");
  const originalMessage = searchParams.get("originalMessage");

  useEffect(() => {
    const verifySignature = async () => {
      if (!data || !originalMessage) {
        console.error("Missing required parameters");
        alert(`Missing required parameters, data..., msg: ${originalMessage}`);
        setIsError(true);
        return;
      }
      try {
        const dataUint8 = bs58.decode(data);
        // const publicKeyObj = new PublicKey(publicKey);

        console.log(dataUint8);
        // alert(dataUint8);

        // const messageBytes = new TextEncoder().encode(originalMessage);

        // const isValid = nacl.sign.detached.verify(
        //   messageBytes,
        //   signatureUint8,
        //   publicKeyObj.toBytes()
        // );

        // if (isValid) {
        //   alert("Signature verified successfully");
        //   redirectToTelegram(true);
        // } else {
        //   alert("Invalid signature");
        //   throw new Error("Invalid signature");
        // }
      } catch (error) {
        console.error("Error verifying signature:", error);
        alert("Failed to verify signature");
        // redirectToTelegram(false);
      }
    };

    verifySignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tgWebAppData, originalMessage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-0 w-full flex justify-center items-center">
        <LogoFull />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex justify-center mb-5">
          <CubesLoading />
        </div>

        <h1 className="text-xl">Verifying signature...</h1>

        <p className="text-sm text-dim leading-[14px] max-w-[300px]">
          Please wait while we verify your wallet signature. You will be
          redirected back to Telegram automatically.
        </p>
      </div>
    </div>
  );
};

export default VerifySignaturePage;
