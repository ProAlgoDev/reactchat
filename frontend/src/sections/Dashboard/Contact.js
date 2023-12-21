import React, { useEffect, useState } from "react";
import { useTheme, styled } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Bell,
  CaretRight,
  Prohibit,
  Star,
  Trash,
  X,
} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import AntSwitch from "../../components/AntSwitch";
import { useDispatch, useSelector } from "react-redux";
import { EmptyCommonGroups, FetchCommonGroups, SelectConversation, ToggleSidebar, UpdateSidebarType, UpdateTab, showSnackbar } from "../../redux/slices/app";
import { socket } from "../../socket";
import { toggleSocket } from "../../redux/slices/conversation";

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Block this contact</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to block this Contact?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteChatDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Delete this chat</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to delete this chat?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const Contact = () => {
  const dispatch = useDispatch();

  const { selectedChat, isGroupChat, chat_id, commonGroups } = useSelector((state) => state.app);

  const theme = useTheme();

  const isDesktop = useResponsive("up", "md");

  const [openBlock, setOpenBlock] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleCloseBlock = () => {
    setOpenBlock(false);
  }
  const handleCloseDelete = () => {
    setOpenDelete(false);
  }

  useEffect(() => {
    if (!isGroupChat) {
      dispatch(FetchCommonGroups({ user_id: selectedChat?.users[0]._id }))
    }
    else {
      dispatch(EmptyCommonGroups())
    }
  }, [chat_id, isGroupChat])

  const handleGroupSelect = ({ _id }) => {
    socket.emit("leave chat", chat_id)
    dispatch(SelectConversation({
      chat_id: _id,
      isGroupChat: true
    }));
    dispatch(ToggleSidebar());
    dispatch(UpdateTab({ tab: 1 }));
    socket.emit("join chat", _id)
    socket.on("connected", () => {
      console.log("Socket Connected")
      dispatch(toggleSocket(true))
    });
  }

  const handleChatSelect = ({ _id }) => {
    socket.emit("leave chat", chat_id)
    dispatch(SelectConversation({
      chat_id: _id,
      isGroupChat: false
    }));
    dispatch(ToggleSidebar());
    dispatch(UpdateTab({ tab: 0 }));
    socket.emit("join chat", _id)
    socket.on("connected", () => {
      console.log("Socket Connected")
      dispatch(toggleSocket(true))
    });
  }

  return (
    <Box sx={{ width: !isDesktop ? "100vw" : 320, maxHeight: "100vh" }}>
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="subtitle2">Contact Info</Typography>
            <IconButton
              onClick={() => {
                dispatch(ToggleSidebar());
              }}
            >
              <X />
            </IconButton>
          </Stack>
        </Box>
        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",
          }}
          p={3}
          spacing={3}
        >
          <Stack alignItems="center" direction="column" spacing={2}>
            <Avatar
              src={(selectedChat?.isGroupChat) ? '' : selectedChat?.users[0].avatar}
              alt={selectedChat?.chatName}
              sx={{ height: 108, width: 108 }}
            />
            <Stack spacing={0.5}>
              <Typography variant="article" fontWeight={600}>
                {selectedChat?.chatName}
              </Typography>
            </Stack>
          </Stack>
          {/* <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-evenly"}
          >
            <Stack alignItems={"center"} spacing={1}>
              <IconButton>
                <Phone />
              </IconButton>

              <Typography variant="overline">Voice</Typography>
            </Stack>
            <Stack alignItems={"center"} spacing={1}>
              <IconButton>
                <VideoCamera />
              </IconButton>
              <Typography variant="overline">Video</Typography>
            </Stack>
          </Stack> */}
          {
            !isGroupChat && (
              <>
                <Divider />
                <Stack spacing={0.3}>
                  <Typography variant="article" fontWeight={600}>
                    About
                  </Typography>
                  <Typography variant="body2" fontWeight={500} paddingLeft={1}>
                    {selectedChat?.users[0].about}
                  </Typography>
                </Stack>
              </>
            )
          }
          {/*           
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Typography variant="subtitle2">Media, Links & Docs</Typography>
            <Button
              onClick={() => {
                dispatch(UpdateSidebarType("SHARED"));
              }}
              endIcon={<CaretRight />}
            >
              401
            </Button>
          </Stack>
          */}
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Star size={21} />
              <Typography variant="subtitle2">Starred Messages</Typography>
            </Stack>

            <IconButton
              onClick={() => {
                // dispatch(UpdateSidebarType("STARRED"));
                dispatch(showSnackbar({ severity: "info", message: "Feature Under Construction" }))
              }}
            >
              <CaretRight />
            </IconButton>
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Bell size={21} />
              <Typography variant="subtitle2">Mute Notifications</Typography>
            </Stack>

            <AntSwitch />
          </Stack>
          <Divider />
          {
            !isGroupChat ? (
              <>
                <Typography variant="body2">{`${commonGroups.length} groups in common`}</Typography>
                <Stack direction={"column"} alignItems={"center"} spacing={1} sx={{ marginTop: 0 }}>
                  {
                    commonGroups?.map((grp, index) => (
                      <StyledChatBox
                        key={index}
                        sx={{
                          width: "100%",
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.paper,
                        }}
                        p={1}
                        onClick={() => handleGroupSelect({ _id: grp._id })}
                      >
                        <Stack
                          direction="row"
                          alignItems={"center"}
                          spacing={2}
                        >

                          <Avatar src={""} alt={"Group"} />
                          <Stack spacing={0.3}>
                            <Typography variant="subtitle2">{grp.chatName}</Typography>
                          </Stack>
                        </Stack>
                      </StyledChatBox>
                    ))
                  }
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="body2">{`${selectedChat?.users?.length} Members`}</Typography>
                <Stack direction={"column"} alignItems={"center"} spacing={1} sx={{ marginTop: 0 }}>
                  {
                    selectedChat?.users?.map((userIngrp, index) => (
                      <StyledChatBox
                        key={index}
                        sx={{
                          width: "100%",
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.paper,
                        }}
                        p={1}
                      // onClick={
                      //   () => handleChatSelect({ _id: ._id })
                      // }
                      >
                        <Stack
                          direction="row"
                          alignItems={"center"}
                          spacing={2}
                        >

                          <Avatar src={userIngrp.avatar} alt={userIngrp.firstName} />
                          <Stack spacing={0.3}>
                            <Typography variant="subtitle2">{userIngrp.firstName + " " + userIngrp.lastName}</Typography>
                          </Stack>
                        </Stack>
                      </StyledChatBox>
                    ))
                  }
                </Stack>
              </>
            )
          }
          <Divider />
          <Stack direction="row" alignItems={"center"} spacing={2}>
            <Button
              onClick={() => {
                setOpenBlock(true);
              }}
              fullWidth
              startIcon={<Prohibit />}
              variant="outlined"
            >
              Block
            </Button>
            <Button
              onClick={() => {
                setOpenDelete(true);
              }}
              fullWidth
              startIcon={<Trash />}
              variant="outlined"
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack >
      {openBlock && <BlockDialog open={openBlock} handleClose={handleCloseBlock} />}
      {openDelete && <DeleteChatDialog open={openDelete} handleClose={handleCloseDelete} />}
    </Box >
  );
};

export default Contact;
