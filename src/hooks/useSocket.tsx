import React from "react";

import openSocket from "socket.io-client";

export const useSocket = () => {
  const host = window.location.origin;
  const socket = React.useMemo(() => {
    const gameSocket = openSocket(host, { path: "/socket" });

    return gameSocket;
  }, []);

  return socket;
}
