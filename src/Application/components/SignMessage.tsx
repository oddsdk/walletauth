import { useMemo, useState } from "react"
import { useAccount } from "wagmi";

import * as ethereum from "../../ethereum"
import * as webnative from "../../webnative"
import WelcomeCheckIcon from "./icons/WelcomeCheckIcon"

const SignMessage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const { isConnected } = useAccount();

  /**
   * Have the user sign a message to generate and verify a Ucan for them
   */
  const signUcanMessage: () => Promise<void> = async () => {
    const ucan = await webnative.createUcan({
      audience: webnative.FISSION_API_DID,
      issuer: await ethereum.did(),
      lifetimeInSeconds: 30,
    });

    const isUcanVerified = await webnative.verifyUcanSignature(ucan);
    setIsVerified(isUcanVerified);
  };

  /**
   * I'm leaving this here for now to preserve the existing behaviour for testing purposes.
   * This will function quite differently once we have all the different pieces working
   */
  useMemo(() => {
    signUcanMessage();
  }, [isConnected]);

  return (
    <div className="flex items-center justify-center text-center h-screenWithoutNav max-w-xs m-auto">
      <div data-theme="light" className="card shadow-xl">
        <div className="card-body">
          {isVerified ? (
            <div className="flex flex-col items-center">
              <h2 className="card-title mb-4">You're all set!</h2>
              <WelcomeCheckIcon />
            </div>
          ) : (
            <div>
              <h2 className="card-title mb-2">
                Thanks for connecting your wallet!
              </h2>
              <p className="mb-4">
                Now you just need to sign this message and we will generate a
                DID for you
              </p>
              <div className="card-actions justify-center">
                <button
                  onClick={signUcanMessage}
                  className="btn btn-primary uppercase"
                >
                  Sign Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignMessage
