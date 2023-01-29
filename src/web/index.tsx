import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("app-root")!;
const root = createRoot(container);

const theme = createTheme();

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <GlobalStyles
      styles={{
        "::-webkit-scrollbar": {
          width: 8 /* width of the entire vertical scrollbar */,
          height: 10 /* width of the entire horizontal scrollbar */,
        },

        "::-webkit-scrollbar-track": {
          background: grey[200] /* color of the tracking area */,
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: grey[500] /* color of the scroll thumb */,
          borderRadius: 1 /* roundness of the scroll thumb */,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: grey[200],
        },
      }}
    />
    <App />
  </ThemeProvider>
);
