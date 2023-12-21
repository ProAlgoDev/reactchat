import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, Slide, Stack, Tab, Tabs } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { FetchUsers } from "../../redux/slices/app";
import { UserElement } from "../../components/UserElement";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const NewChat = ({ open, handleClose }) => {

  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(FetchUsers());
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{ p: 4 }}
    >
      <Stack width={"100%"} direction={"row"} justifyContent={"center"}>
        <DialogTitle>Start New Chat</DialogTitle>
      </Stack>
      <DialogContent>
        <Stack sx={{ height: "100%" }}>
          <Stack>
            {users.map((el, idx) => {
              return <UserElement key={idx} {...el} handleClose={handleClose} />;
            })}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NewChat;
