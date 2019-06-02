import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {confimSignUp, signIn} from './CognitoHelperFunctions'
import { DialogTitle, DialogActions, DialogContent, Typography } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

export default class ResetDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: '',
      message: 'Enter the confirmation code sent to this email address'
    };
    this.code = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.open && !nextProps.open) {
      return false;
    }
    return true;
  }

  handleChange = name => event => {
    if (name === 'email') {
      this.props.updateEmail(event.target.value)
    } else {
      this.setState({
        [name]: event.target.value,
      });
    }
  };

  handleClose = () => {
    const confirmSuccess = () => {
      const signinSuccess = (result) => {
        this.context.updateAuth(result);
        this.props.finalise({});
      }
      const signinFailure = (err) => {
        console.log(err);
        this.setState({message: err.message});
      }
      
      signIn(
        this.props.email, this.state.password,
        signinSuccess, signinFailure
      );
    }

    const confirmFailure = (err) => {
      console.log(err);
      this.setState({message: err.message});
    }

    if (this.props.email && this.state.code) {
      confimSignUp(
        this.props.email, this.state.code,
        confirmSuccess, confirmFailure
      )
    }
  };

  handleCancel = () => {
    this.setState({code: ''});
    this.props.finalise({});
  }

  render() {
    return (
      <div>
        <Dialog
          TransitionComponent={Transition}
          open={this.props.open}
          onClose={this.handleCancel}
          onBackdropClick={this.handleCancel}
          aria-labelledby="confirmation-dialog-title"
        >
          <DialogTitle id="confirmation-dialog-title">Set Password</DialogTitle>
          <DialogContent>
            <Typography>{this.state.message}</Typography>
            <TextField
              disabled
              label="Email"
              defaultValue={this.props.email}
              margin="dense"
              fullWidth
            />
            <TextField
              label="Verification Code"
              autoFocus
              value={this.state.code}
              onChange={this.handleChange('code')}
              margin="dense"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleCancel}>
              Cancel
            </Button>
            <Button color="primary" keyboardFocused={true} onClick={this.handleClose}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}