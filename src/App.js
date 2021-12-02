import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

//Import Component and Service
import { post } from './httpHelper'
import Form from "react-validation/build/form";
import AuthService from "./services/auth.service";
import Home from "./component/Home";
import Login from "./component/Login/login.component";
import ForgotPassword from "./component/ForgotPassword";

import Input from "@material-ui/core/Input";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button } from "@material-ui/core";
import AppProvider from "./Context/AppProvider";

class App extends Component {
  constructor(props) {
    super(props);
    this.onChangePassword = this.onChangePassword.bind(this)
    this.state = {
      message: "",
      open: false,
      isfirstLogin: false,
      showPassword: false,
      newPassword: ""
    };

  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();
    if (user) {
      if (user === undefined)
        this.props.history.push('/login')
      if (user.firstLogin)
        this.setState({ isfirstLogin: user.firstLogin })
    } else {
      this.props.history.push('/login')
    }
  }

  onChangePassword(e) {
    this.setState({ newPassword: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.state.newPassword)
      this.setState({
        open: true,
        message: "Password can not be blank!"
      })
    else if (this.state.newPassword.length < 8 || this.state.newPassword.length > 36)
      this.setState({
        open: true,
        message: "Password must be from 8 to 36 characters!"
      })
    else {
      const data = {
        "password": this.state.newPassword
      }
      var user = AuthService.getCurrentUser();
      post("/auth/firstlogin", data)
        .then(() => {
          user.firstLogin = false;
          localStorage.setItem("user", JSON.stringify(user));
          this.setState({ isfirstLogin: false })
        })
        .catch((err) => {
          console.log(err);
          alert(err)
        });
    }
  };

  render() {
    const isEnabled = this.state.newPassword.length > 0
    return (
      <div className="App">
        <Switch>
          <Route exact path={["/login"]} component={Login} />
          <Route exact path={["/forgot"]} component={ForgotPassword} />
          <AppProvider>
            <Route path={["/"]} component={Home} />
          </AppProvider>
        </Switch>
        {/* Dialog first login required change password */}
        <Dialog
          open={this.state.isfirstLogin}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="dialog-first-login"
        >
          <div className='cardReset card-container'>
            <div className='title'>
              <h3 className="resettitle">Change Password</h3>
            </div>
          </div>
          <div className="cardreset card-container">
            <Form className='resetform'
              onSubmit={this.handleSubmit}
              ref={(c) => {
                this.form = c;
              }}
            >
              <div className="form-group">
                <p className="paraphtext">
                  This is the first time you logged in. <br />
                  You have to change your password to continue.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                  <span className="star"> *</span></label>
                <Input
                  id="standard-adornment-password"
                  className="first-login form-control"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={this.state.newPassword}
                  onChange={this.onChangePassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                      >
                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </div>
              <div className="form-group">
                <button
                  className="btnsave btn btn-danger btn-block"
                  disabled={!isEnabled}
                >
                  <span>Save</span>
                </button>
              </div>
            </Form>
          </div>
        </Dialog>
        <Dialog
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Notification"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ open: false })}
              color="primary" autoFocus
            >
              Okay!
            </Button>
          </DialogActions>
        </Dialog>
      </div >
    );
  }
}

export default withRouter(App)