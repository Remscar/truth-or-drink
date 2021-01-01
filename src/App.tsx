import { CssBaseline } from "@material-ui/core";
import React from "react";
import { AppRouter } from "./AppRouter";
import { GlobalProviders } from "./GlobalProviders";
import { WaitForGameState } from "./hooks/useGameState";

function App() {

  React.useEffect(() => {
    document.title = "Truth Or Drink Online"
 }, []);

  return (
    <CssBaseline>
      <GlobalProviders>
        <WaitForGameState>
          <AppRouter />
        </WaitForGameState>
      </GlobalProviders>
    </CssBaseline>
  );
}

export default App;
