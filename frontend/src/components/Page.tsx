import * as React from 'react';
import {Container} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";


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
            <Typography className={classes.title} component="h1" variant="h5">
                {props.title}
            </Typography>
            {props.children}
        </Container>
    );
};