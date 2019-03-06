import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {signIn} from './CognitoHelperFunctions'
import { DialogTitle, DialogActions, DialogContent, Typography } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

export default class SignInDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      message: '',
    };
    this.email = React.createRef();
    this.password = React.createRef();
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleClose = () => {
    const signinSuccess = (result) => {
      this.props.updateAuth(result);
      this.props.finalise();
    }
    const signinFailure = (err) => {
      console.log(err);
      this.setState({message: err.message});
    }
    if (this.state.email && this.state.password) {
      signIn(
        this.state.email, this.state.password,
        signinSuccess, signinFailure
      );
    }
  };

  handleCancel = () => {
    this.setState({password: ''});
    this.props.finalise();
  }

  handleRegister = () => {
    this.props.finalise({email: this.state.email});
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
          <DialogTitle id="confirmation-dialog-title">Sign In</DialogTitle>
          <DialogContent>
            <Typography>{this.state.message}</Typography>
            <TextField
              label="Email"
              autoFocus
              value={this.state.email}
              onChange={this.handleChange('email')}
              margin="dense"
              fullWidth
            />
            <TextField
              type='password'
              label="Password"
              value={this.state.password}
              onChange={this.handleChange('password')}
              margin="dense"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary"  onClick={this.handleRegister}>
              Register/Reset
            </Button>
            <Button color="primary"  onClick={this.handleCancel}>
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