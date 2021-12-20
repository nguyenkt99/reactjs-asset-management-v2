import React, { Component } from 'react';
import Form from 'react-validation/build/form';
import CheckButton from 'react-validation/build/button';

import Input from '@material-ui/core/Input';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import './login.css';
import AuthService from '../../services/auth.service';
import { Button } from '@material-ui/core';

import logo from '../../assets/Logo_lk.png';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

export default class Login extends Component {
  constructor(props) {
    super(props);
    const user = AuthService.getCurrentUser();
    if (user) {
      this.props.history.push('/');
      window.location.reload();
    }
    this.handleLogin = this.handleLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.state = {
      username: '',
      password: '',
      message: '',
      showPassword: false,
      open: false,
      isSaving: false
    };
  }

  onChangeUsername(e) {
    this.setState({ username: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleLogin(e) {
    e.preventDefault();
    this.setState({
      message: '',
    });
    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      this.setState({ isSaving: true });
      AuthService.login(this.state.username, this.state.password)
        .then(() => {
          //Quay tro ve Trang Home
          this.props.history.push("/home");
          window.location.reload();
        })
        .catch((error) => {
          this.setState({ isSaving: false });

          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          if (error.response.status === 401)
            this.setState({
              message: 'Username or password is incorrect. Please try again',
              open: true,
            });
          else if (error.response.status === 409)
            this.setState({
              message: 'Account is disabled! Please contact admin.',
              open: true,
            });
          else
            this.setState({
              message: resMessage,
              open: true,
            });
        });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    nextState.invalidData = !(nextState.username || nextState.password);
  }

  onDismiss;

  render() {
    const { username, password } = this.state;
    const isEnabled = username.length > 0 && password.length > 0;
    return (
      <>
        <nav className='navbar-login navbar-expand'>
          <div className='container'>
            <div className='navbar-login__brand'>
              <img className='navbar-login__logo' src={logo} alt="Logo login" />
              <div className='navbar-login__title'>
                <span>Online Asset Management</span>
              </div>
            </div>
          </div>
        </nav>
        <div className='container'>
          <div className='row'>
            <div className='col-12 col-md-12'>
              <div className='login-card'>
                <div className='cardTitle card-container'>
                  <div className='title'>
                    <h4 className='logintitle'>
                      Welcome to Online Asset Management
                    </h4>
                  </div>
                </div>
                <div className='cardLogin card-container'>
                  <Dialog
                    open={this.state.open}
                    onClose={() => this.setState({ open: false })}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'>
                    <DialogTitle id='alert-dialog-title'>
                      {'Notification'}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id='alert-dialog-description'>
                        {this.state.message}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => this.setState({ open: false })}
                        color='primary'
                        autoFocus>
                        Okay!
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Form
                    className='loginform'
                    onSubmit={this.handleLogin}
                    ref={(c) => {
                      this.form = c;
                    }}>
                    <div className='form-group login-group'>
                      <label htmlFor='username' className='login-label'>
                        Username
                        <span className='star'> *</span>
                      </label>
                      <Input
                        style={{fontSize: "1.4rem"}}
                        type='text'
                        className='login lguser form-control'
                        name='username'
                        value={this.state.username}
                        onChange={this.onChangeUsername}
                      />
                    </div>

                    <div className='form-group login-group'>
                      <label htmlFor='password' className='login-label'>
                        Password
                        <span className='star'> *</span>
                      </label>
                      <Input
                        style={{fontSize: "1.4rem"}}
                        id='standard-adornment-password'
                        className='login lguser form-control'
                        type={this.state.showPassword ? 'text' : 'password'}
                        value={this.state.password}
                        onChange={this.onChangePassword}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={() =>
                                this.setState({
                                  showPassword: !this.state.showPassword,
                                })
                              }>
                              {this.state.showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </div>
                    <div>
                      <Link style={{ textDecoration: "none" }} className="float-end mx-1" to="/forgot">
                        Forgotten password?
                      </Link>
                    </div>
                    {/* <div className='form-group login-group'> */}
                    <div className='form-group'>
                      {this.state.isSaving ?
                        <button
                          className='btnlogin btn btn-primary btn-block'
                          disabled>
                          <Spinner animation="border" size="sm" variant="light" />
                          <span>Login</span>
                        </button>
                        :
                        <button
                          className='btnlogin btn btn-primary btn-block'
                          disabled={!isEnabled}>
                          <span>Login</span>
                        </button>
                      }
                    </div>
                    <CheckButton
                      style={{ display: 'none' }}
                      ref={(c) => {
                        this.checkBtn = c;
                      }}
                    />
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
