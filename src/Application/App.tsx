import { useAccount } from "wagmi";

import Header from "./components/Header";
import SignMessage from "./components/SignMessage";

const App = () => {
  const { isConnected } = useAccount()

  return (
    <div>
      <Header />

      {isConnected && <SignMessage />}
    </div>
  )
}

export default App;
