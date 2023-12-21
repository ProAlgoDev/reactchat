import { useTheme } from "@mui/material/styles";
import LogoDark from "../assets/Images/logo-light.ico";
import LogoLight from "../assets/Images/logo-dark.ico";


const Logo = () => {
    const theme = useTheme();

    return (
        <>
            <img style={{ height: "100%", width: "100%" }} src={
                theme.palette.mode === "light" ?
                    LogoDark :
                    LogoLight
            } alt="Logo" />
        </>
    );
};

export default Logo;
