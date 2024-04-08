import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const Room = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New user joined", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incomming call", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, answer: ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { answer } = data;
      console.log("Call got accepted", answer);
      await setRemoteAnswer(answer);
    },
    [setRemoteAnswer]
  );

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  const handleNegotiation = useCallback(() => {
    console.log("nego needed");
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [peer.localDescription, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [handleNewUserJoined, handleIncommingCall, handleCallAccepted, socket]);

  //   useEffect(() => {
  //     peer.addEventListener("negotiationneeded", handleNegotiation);
  //     return () => {
  //       peer.removeEventListener("negotiationneeded", handleNegotiation);
  //     };
  //   }, [peer, handleNegotiation]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="room-container">
      <h1>Room</h1>
      <h4>You are connected to {remoteEmailId}</h4>
      <button onClick={(e) => sendStream(myStream)}>Send My Video</button>
      <ReactPlayer url={myStream} playing={true} muted />
      <ReactPlayer url={remoteStream} playing={true} />
    </div>
  );
};

export default Room;
