import React, { useEffect } from "react";
import { Box, Badge, Stack, Avatar, Typography } from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import convertTimeStamp from "../utils/convertTimeStamp";
import { socket } from "../socket";
import { toggleSocket } from "../redux/slices/conversation";

const truncateText = (string, n) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const ChatElement = ({ _id, users, latestMessage, isGroupChat, chatName }) => {
  const dispatch = useDispatch();
  const { chat_id } = useSelector((state) => state.app);
  const { _id: user_id } = useSelector((state) => state.app.user);

  let isSelected = (chat_id === _id);

  if (!chat_id) {
    isSelected = false;
  }
  useEffect(() => {

  }, [chat_id, latestMessage])

  const handleSelect = () => {
    socket.emit("leave chat", chat_id)
    dispatch(SelectConversation({
      chat_id: _id,
      isGroupChat: isGroupChat
    }));
    socket.emit("join chat", _id)
    socket.on("connected", () => {
      console.log("Socket Connected")
      dispatch(toggleSocket(true))
    });
  }

  const theme = useTheme();

  return (
    <StyledChatBox
      onClick={handleSelect}
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: isSelected
          ? theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.5)
            : theme.palette.primary.main
          : theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"flex-end"}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2}>
          {" "}
          {!isGroupChat ? (
            (users[0]?.status === "online") ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <Avatar alt={users[0]?.firstName} src={users[0]?.avatar} />
              </StyledBadge>
            ) : (
              <Avatar alt={users[0]?.firstName} src={users[0]?.avatar} />
            )) : (
            <Avatar alt={chatName} src={""} />
          )
          }
          <Stack>
            {
              isGroupChat ? (
                <Typography variant="subtitle2">{chatName}</Typography>
              ) : (
                <Typography variant="subtitle2">{users[0]?.firstName + " " + users[0]?.lastName}</Typography>
              )
            }

            <Stack direction={"row"} spacing={0.5}>
              <Typography variant="caption" sx={{
                "fontWeight": "600",
              }}>{
                  latestMessage
                    ? latestMessage.sender._id === user_id
                      ? `You: `
                      : `${(latestMessage.sender.firstName).trim()}: `
                    : ""
                }
              </Typography>
              <Typography variant="caption" sx={{
                "fontWeight": "500",
              }}>{
                  latestMessage
                    ? truncateText(latestMessage.content, 20)
                    : ""
                }
              </Typography>
            </Stack>

          </Stack>
        </Stack>
        <Stack spacing={2} alignItems={"end"} direction="column">
          <Typography sx={{ fontWeight: 600 }} variant="caption">
            {
              latestMessage
                ? convertTimeStamp(latestMessage.createdAt)
                : ""
            }
          </Typography>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export default ChatElement;
