import { FC, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { redirectToTelegram } from "@/helpers/redirectToTelegram";
import { useSignMessageMutation } from "@/redux/services/wallet.api";

const VerifySignaturePage: FC = () => {
  const [searchParams] = useSearchParams();

  const data = searchParams.get("data");
  const nonce = searchParams.get("nonce");
  const userId = searchParams.get("userId");

  const [signMessage] = useSignMessageMutation();

  useEffect(() => {
    const verifySignature = async () => {
      if (!data || !nonce) {
        alert(`Missing required parameters`);
        return;
      }
      try {
        signMessage({
          telegramId: userId!,
          data,
          nonce,
        })
          .unwrap()
          .then((res) => {
            if (res.success) {
              alert("SIGNED");
              redirectToTelegram();
            }
          });
      } catch {
        alert("Failed to verify signature");
        redirectToTelegram();
      }
    };

    verifySignature();
  }, [userId, signMessage, nonce, data]);

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
