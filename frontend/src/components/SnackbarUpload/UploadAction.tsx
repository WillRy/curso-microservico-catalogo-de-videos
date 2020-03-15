import * as React from 'react';
import {Fade, ListItemSecondaryAction, IconButton, Theme} from "@material-ui/core";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import {makeStyles} from "@material-ui/core/styles";

const useStyle = makeStyles((theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main
    },
    errorIcon: {
        color: theme.palette.error.main
    }
}));

interface UploadActionProps {

}

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const classes = useStyle();
    return (
        <Fade in={true} timeout={{enter: 1000}}>
            <ListItemSecondaryAction>
                <span>
                    {
                        <IconButton className={classes.successIcon}>
                            <CheckCircleIcon/>
                        </IconButton>
                    }
                    {
                        <IconButton className={classes.errorIcon}>
                            <ErrorIcon/>
                        </IconButton>
                    }
                </span>
                <span>
                    <IconButton color={"primary"}>
                       <DeleteIcon/>
                    </IconButton>
                </span>
            </ListItemSecondaryAction>
        </Fade>
    );
};

export default UploadAction;