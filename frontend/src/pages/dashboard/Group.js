import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Link,
  Divider,
} from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import CreateGroup from "../../sections/Dashboard/CreateGroup";
import useResponsive from "../../hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { FetchChats, UpdateTab } from "../../redux/slices/app";
import BottomNav from "../../layouts/dashboard/BottomNav";

const Group = () => {
  const theme = useTheme();
  const isDesktop = useResponsive("up", "md");

  const dispatch = useDispatch();

  const { chats } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(FetchChats())
    dispatch(UpdateTab({ tab: 1 }))
  }, []);

  useEffect(() => {

  }, [chats]);

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  }
  const handleOpenDialog = () => {
    setOpenDialog(true);
  }
  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: isDesktop ? 320 : "100vw",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {!isDesktop && (
          // Bottom Nav
          <BottomNav />
        )}

        <Stack p={3} pr={1.5} spacing={2} sx={{ maxHeight: "100vh", height: "100%" }}>
          <Stack
            alignItems={"center"}
            justifyContent="space-between"
            direction="row"
            pr={1.5}
          >
            <Typography variant="h5">Groups</Typography>

            <Stack direction={"row"} alignItems="center" spacing={1}>
              <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
                sx={{ width: "max-content" }}
              >
                < Plus />
              </IconButton>
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%", height: "auto" }} pr={1.5}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Stack>
          {/* <Stack spacing={1}>
            <Stack direction={"row"} spacing={1.5} alignItems="center">
              <ArchiveBox size={24} />
              <Button variant="text">Archive</Button>
            </Stack>
            <Divider />
          </Stack> */}
          <Stack sx={{ flexGrow: 1, overflowY: "scroll", height: "100%" }} pr={0.5}>
            <Stack spacing={1} >
              {/* <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  Pinned
                </Typography> */}
              {/* Chat List */}
              {/* {ChatList.filter((el) => el.pinned).map((el, idx) => {
                  return <ChatElement {...el} />;
                })} */}
              <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                All Groups
              </Typography>
              {/* Chat List */}
              {chats.filter((chat) => (chat.isGroupChat)).map((chat, idx) => {
                return <ChatElement {...chat} key={idx} />;
              })}
            </Stack>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Group;
