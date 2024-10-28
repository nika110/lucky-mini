/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect } from "react";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { useSearchParams } from "react-router-dom";
import bs58 from "bs58";
import { randomBytes } from "tweetnacl";
import { ROUTES } from "@/routes/routes";
// import { decodeBase58 } from "@/helpers/base58";

const MESSAGE_SIGN =
  "Verify wallet to prove ownership of this wallet, to make actions on this website No SOL is charged";

interface SignMessagePayload {
  message: string;
  session: string;
  display: "utf8" | "hex";
}

const ConnectSolPage: FC = () => {
  const [searchParams] = useSearchParams();
  const userIdQuery = searchParams.get("userId");
  const webAppDataQuery = searchParams.get("tgWebAppData");
  const appUrl = searchParams.get("appUrl");
  const errorCode = searchParams.get("errorCode");
  const phantomPublicKey = searchParams.get("phantom_encryption_public_key");
  const nonce = searchParams.get("nonce");
  const dataConnect = searchParams.get("data");

  useEffect(() => {
    const handleSignMessage = async () => {
      if (!phantomPublicKey || !userIdQuery || !dataConnect || !nonce) return;

      try {
        const signMessageUrl = new URL("https://phantom.app/ul/v1/signMessage");

        signMessageUrl.searchParams.set("app_url", appUrl!);

        // const nonce = randomBytes(32);
        // const nonceBase58 = bs58.encode(nonce);
        signMessageUrl.searchParams.set("nonce", nonce);

        signMessageUrl.searchParams.set(
          "dapp_encryption_public_key",
          phantomPublicKey
        );

        signMessageUrl.searchParams.set(
          "redirect_link",
          `${window.location.origin}${ROUTES.SIGN_SOL}/?userId=${userIdQuery}&tgWebAppData=${webAppDataQuery}&appUrl=${appUrl}&originalMessage=${MESSAGE_SIGN}`
        );

        const decoderUtf8 = new TextDecoder("utf-8");
        const decodedData = bs58.decode(dataConnect);
        console.log(decoderUtf8.decode(decodedData));

        // const payloadData: SignMessagePayload = {
        //   message: bs58.encode(Buffer.from(MESSAGE_SIGN)),
        //   session: sessionToken,
        //   display: "utf8",
        // };

        // const payload: SignMessagePayload = {
        //   message: bs58.encode(Buffer.from(MESSAGE_SIGN)),
        //   session: sessionToken,
        //   display: "utf8",
        // };

        // const nonce = randomBytes(32);
        // const nonceBase58 = bs58.encode(nonce);

        // signMessageUrl.searchParams.set(
        //   "dapp_encryption_public_key",
        //   phantomPublicKey
        // );
        // signMessageUrl.searchParams.set("nonce", nonceBase58);
        // signMessageUrl.searchParams.set(
        //   "redirect_link",
        //   encodeURIComponent(
        //     `${window.location.origin}${ROUTES.SIGN_SOL}/?userId=${userIdQuery}&tgWebAppData=${webAppDataQuery}&appUrl=${appUrl}&originalMessage=${MESSAGE_SIGN}`
        //   )
        // );

        // const encryptedPayload = JSON.stringify(payload);
        // signMessageUrl.searchParams.set("payload", encryptedPayload);

        // window.location.href = signMessageUrl.toString();
      } catch (error) {
        console.error("Error initiating message signing:", error);
        window.open(appUrl!, "_blank");
      }
    };

    if (phantomPublicKey && !errorCode && dataConnect) {
      handleSignMessage();
    } else if (errorCode || !userIdQuery || !webAppDataQuery || !appUrl) {
      // window.open(appUrl!, "_blank");
      alert("Something went wrong, please try again");
    }
  }, [
    phantomPublicKey,
    userIdQuery,
    webAppDataQuery,
    appUrl,
    errorCode,
    dataConnect,
    nonce,
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-0 w-full flex justify-center items-center">
        <LogoFull />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex justify-center mb-5">
          <CubesLoading />
        </div>

        <h1 className="text-xl">
          {phantomPublicKey
            ? "Requesting signature..."
            : "Establishing connection..."}
        </h1>

        <p className="text-sm text-dim leading-[14px] max-w-[300px]">
          {phantomPublicKey
            ? "Please sign the message in your Phantom wallet to complete verification"
            : "Please wait while we connect to your Solana wallet"}
        </p>
      </div>
    </div>
  );
};

export default ConnectSolPage;
