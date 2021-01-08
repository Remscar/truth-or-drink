import React from "react";

import openSocket from "socket.io-client";

const numDisconnectCountsUntilRetry = 2;

export const useSocket = (path = "/socket") => {
  const host = window.location.origin;
  const [shouldRefreshSocket, setRefreshSocket] = React.useState<number>(0);
  const [disconnectedCount, setDisconnectedCount] = React.useState<number>(0);

  const refreshSocket = () => {
    setRefreshSocket(shouldRefreshSocket + 1);
  }
  

  const socket = React.useMemo(() => {
    const gameSocket = openSocket(host, { path });

    gameSocket.on("error", (e) => {
      console.log("socket error");
      console.log(e);
    });

    return gameSocket;
  }, []);
  

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, [shouldRefreshSocket]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (socket.connected) {
        return;
      }

      if (disconnectedCount >= numDisconnectCountsUntilRetry) {
        refreshSocket();
        setDisconnectedCount(0);
      } else {
        setDisconnectedCount(disconnectedCount + 1);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    }
  }, []);

  return socket;
};
