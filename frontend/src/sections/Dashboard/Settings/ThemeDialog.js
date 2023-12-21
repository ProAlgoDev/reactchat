import React from "react";
import {
  Dialog,
  Slide,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useSettings from "../../../hooks/useSettings";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ThemeDialog = ({ open, handleClose }) => {
  const theme = useTheme();
  const { onToggleMode } = useSettings();

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{
          mb: 2,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}>{"Choose Theme"}</DialogTitle>
        <DialogContent>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue={theme?.palette?.mode}
              name="radio-buttons-group"
            >
              <FormControlLabel
                value="light"
                control={<Radio />}
                label="Light"
              />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              {/* <FormControlLabel
                value="system"
                control={<Radio />}
                label="System Default"
              /> */}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={onToggleMode}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ThemeDialog;
