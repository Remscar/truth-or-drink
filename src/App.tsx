import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { AppRouter } from "./AppRouter";
import { GlobalProviders } from "./GlobalProviders";
import { WaitForGameState } from "./hooks/useGameState";

function App() {
  React.useEffect(() => {
    document.title = "Truth Or Drink Online";
  }, []);

  const theme = createMuiTheme({
    palette: {
      type: "dark",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <GlobalProviders>
          <WaitForGameState>
            <AppRouter />
          </WaitForGameState>
        </GlobalProviders>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
