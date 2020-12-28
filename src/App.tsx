import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import React from "react";
import { AppRouter } from "./AppRouter";
import { GlobalProviders } from "./GlobalProviders";

function App() {
  return (
      <CssBaseline>
        <GlobalProviders>
          <AppRouter />
        </GlobalProviders>
      </CssBaseline>
  );
}

export default App;
