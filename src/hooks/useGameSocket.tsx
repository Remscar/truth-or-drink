import React from "react";
import { useSocket } from "./useSocket";

export interface GameSocket {
  gameSocket: SocketIOClient.Socket;
}

const gameSocketContext = React.createContext<GameSocket | undefined>(undefined);


export const GameSocketContextProvider: React.FC = (props) => {

  const gameSocket = useSocket();

  let contextValue: GameSocket = {
    gameSocket
  };

  return (
    <gameSocketContext.Provider value={contextValue}>
      {props.children}
    </gameSocketContext.Provider>
  );
};

export const useGameSocket = () => {
  const context = React.useContext(gameSocketContext);
  if (!context) {
    throw Error(`No game socket`);
  }

  return context;
}