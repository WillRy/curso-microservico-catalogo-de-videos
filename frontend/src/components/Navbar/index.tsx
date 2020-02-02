import * as React from 'react';
import {AppBar, Button,  Theme, Toolbar, Typography} from "@material-ui/core";
import logo from "../../static/logo.png";
import {makeStyles} from "@material-ui/core/styles";
import {Menu} from "./menu";

const useStyles = makeStyles((theme: Theme) => ({
    toolbar: {
        backgroundColor: '#000'
    },
    title: {
        flexGrow: 1,
        textAlign: 'center'

    },
    logo: {
        width: 100,
        [theme.breakpoints.up('sm')]: {
            width: 170
        },
        verticalAlign: 'middle'
    }
}));

export const Navbar: React.FC = () => {
    const classes = useStyles();
    return (
        <AppBar>
            <Toolbar className={classes.toolbar}>
                <Menu/>
                <Typography className={classes.title}>
                    <img src={logo} alt="CodeFlix" className={classes.logo}/>
                </Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
};