import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket } = useSocket();
  const [emailId, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [handleRoomJoined, socket]);

  const handleJoinRoom = () => {
    socket.emit("join-room", { emailId, roomId });
  };

  return (
    <div className="home-container">
      <div className="input-container">
        <input
          type="email"
          placeholder="Your Email ID"
          value={emailId}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Enter Room</button>
      </div>
    </div>
  );
};

export default Home;
