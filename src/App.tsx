import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import { AppRouter } from "./AppRouter";
import { GlobalProviders } from "./GlobalProviders";
import { WaitForGameState } from "./hooks/useGameState";

function App() {
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
