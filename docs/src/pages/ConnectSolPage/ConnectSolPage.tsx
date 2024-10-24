import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { FC } from "react";
import { useSearchParams } from "react-router-dom";

const ConnectSolPage: FC = () => {
  const [searchParams] = useSearchParams();
  const userIdQuery = searchParams.get("userId");
  const webAppDataQuery = searchParams.get("tgWebAppData");
  const appUrl = searchParams.get("appUrl");
  const errorCode = searchParams.get("errorCode");
  const phantomPublicKey = searchParams.get("phantom_encryption_public_key");
  const dataQuery = searchParams.get("data");

  if (errorCode || !userIdQuery || !webAppDataQuery || !appUrl) {
    window.open(appUrl!, "_blank");
  }

  if (phantomPublicKey || dataQuery) {
    console.log(phantomPublicKey, dataQuery);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-0 w-full flex justify-center items-center">
        <LogoFull />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Спиннер */}
        <div className="flex justify-center mb-5">
          <CubesLoading />
        </div>

        {/* Основной текст */}
        <h1 className="text-xl">Establishing connection...</h1>

        {/* Дополнительный текст */}
        <p className="text-sm text-dim leading-[14px] max-w-[300px]">
          Please wait while we connect to your Solana wallet
        </p>
      </div>
    </div>
  );
};

export default ConnectSolPage;
