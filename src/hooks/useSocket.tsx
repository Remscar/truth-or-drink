import React from "react";

import openSocket from "socket.io-client";

export const useSocket = (path = "/socket") => {
  const host = window.location.origin;
  const socket = React.useMemo(() => {
    const gameSocket = openSocket(host, { path });

    gameSocket.on("error", (e) => {
      console.log("socket error");
      console.log(e);
    });

    return gameSocket;
  }, []);

  return socket;
};
