import { Stack, Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";

import { ChatHeader, ChatFooter } from "../../components/Chat";
import useResponsive from "../../hooks/useResponsive";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  Timeline,
} from "../../sections/Dashboard/Conversation";
import { useDispatch, useSelector } from "react-redux";

import { socket } from "../../socket";
import { FetchConversations, messageReceived, toggleSocket, toggleTyping, toggleUpdated } from "../../redux/slices/conversation";
import { FetchChats, newNotification } from "../../redux/slices/app";

const Conversation = ({ isMobile, menu }) => {
  const dispatch = useDispatch();

  const { conversations } = useSelector(
    (state) => state.conversation
  );
  const { chat_id } = useSelector((state) => state.app);
  const { _id } = useSelector((state) => state.app.user);
  const { isTyping, isSocketConnected } = useSelector((state) => state.conversation);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { user_id } = useSelector((state) => state.app);
  const { notification } = useSelector((state) => state.app);
  const { user } = useSelector((state) => state.app);
  const { isUpdated } = useSelector((state) => state.conversation);

  useEffect(() => {
    dispatch(FetchConversations())
    if (!isSocketConnected) {
      socket.emit("join chat", chat_id)
      socket.on("connected", () => {
        dispatch(toggleSocket(true));
        console.log("Socket Connected")
      });
    }
  }, [chat_id]);

  // useEffect(() => {

  // });

  useEffect(() => {
    if (isSocketConnected) {
      socket.on("message recieved", async (newMessageRecieved) => {
        console.log("this?");
        if (isUpdated) return;

        if (!chat_id || (chat_id !== newMessageRecieved.chat._id)) {
          // if (!(notification.includes(newMessageRecieved))) {
          dispatch(newNotification(newMessageRecieved));
          // }
        } else {
          console.log("Dispatching New Message")
          dispatch(messageReceived(newMessageRecieved));
        }
      });
    }
  }, []);

  useEffect(() => {
    //   // Update UI when conversation changes
    console.log("working", conversations);
    dispatch(toggleUpdated(false))
  }, [conversations]);

  return (
    <Box p={isMobile ? 1 : 3}>
      <Stack spacing={1}>
        {conversations?.map((el, idx) => {
          switch (el.type) {
            case "img":
              return (
                // Media Message
                <MediaMsg el={el} menu={menu} key={idx} />
              );

            case "doc":
              return (
                // Doc Message
                <DocMsg el={el} menu={menu} key={idx} />
              );
            case "Link":
              return (
                //  Link Message
                <LinkMsg el={el} menu={menu} key={idx} />
              );

            case "reply":
              return (
                //  ReplyMessage
                <ReplyMsg el={el} menu={menu} key={idx} />
              );

            default:
              return (
                // Text Message
                <TextMsg el={el} menu={menu} key={idx} incoming={!(_id === el.sender._id)} />
              );
          }
        })}
      </Stack>
    </Box>
  );
};

const ChatComponent = () => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();

  const messageListRef = useRef(null);

  const { conversations } = useSelector(
    (state) => state.conversation
  );

  useEffect(() => {
    // Scroll to the bottom of the message list when new messages are added
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [conversations]);

  return (
    <Stack
      height={"100%"}
      maxHeight={"100vh"}
      width={isMobile ? "100vw" : "auto"}
    >
      {/*  */}
      <ChatHeader />
      <Box
        ref={messageListRef}
        width={"100%"}
        sx={{
          position: "relative",
          flexGrow: 1,
          overflow: "scroll",
          overflowX: "hidden",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* <SimpleBarStyle timeout={500} clickOnTrack={false}> */}
        <Conversation menu={true} isMobile={isMobile} />
        {/* </SimpleBarStyle> */}
      </Box>

      {/*  */}
      <ChatFooter />
    </Stack>
  );
};

export default ChatComponent;

export { Conversation };
