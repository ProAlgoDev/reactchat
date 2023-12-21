import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack } from "@mui/material";
import ProfileMenu from "./ProfileMenu";
import { Nav_Buttons } from "../../data";
import { useDispatch, useSelector } from "react-redux";
import { UpdateTab, showSnackbar } from "../../redux/slices/app";
import { useNavigate } from "react-router-dom";

const getPath = (index) => {
  switch (index) {
    case 0:
      return "/app";

    case 1:
      return "/group";

    case 2:
      return "/call";

    case 3:
      return "/settings";

    default:
      break;
  }
};

const BottomNav = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { tab } = useSelector((state) => state.app);
  const handleChangeTab = (index) => {
    if (index === 2) {
      dispatch(showSnackbar({ severity: "info", message: "Feature Under Construction" }));
      return;
    }
    dispatch(UpdateTab({ tab: index }));
    navigate(getPath(index));
  };

  return (
    <Box
      sx={{
        zIndex: 10,
        position: "absolute",
        bottom: 0,
        width: "100vw",

        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        sx={{ width: "100%" }}
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
        spacing={2}
        p={2}
      >
        {Nav_Buttons.map((el) => {
          return el.index === tab ? (
            <Box sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 1.5 }} p={1}>
              <IconButton sx={{ width: "max-content", color: "#ffffff" }}>
                {el.icon}
              </IconButton>
            </Box>
          ) : (
            <IconButton
              onClick={() => {
                handleChangeTab(el.index);
              }}
              sx={{
                width: "max-content",
                color:
                  theme.palette.mode === "light"
                    ? "#080707"
                    : theme.palette.text.primary,
              }}
            >
              {el.icon}
            </IconButton>
          );
        })}
        <ProfileMenu />
      </Stack>
    </Box>
  );
};

export default BottomNav;
