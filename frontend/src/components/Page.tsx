import * as React from 'react';
import {Box, Container} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";


const useStyles = makeStyles({
    title: {
        color: '#999'
    }
});

type PageProps = {
    title: string
};
export const Page:React.FC<PageProps> = (props) => {
    const classes = useStyles();
    return (
        <Container>
            <Paper style={{padding: '16px'}}>
            <Typography className={classes.title} component="h1" variant="h5">
                {props.title}
            </Typography>
            <Box paddingTop={2}>
                {props.children}
            </Box>
            </Paper>
        </Container>
    );
};