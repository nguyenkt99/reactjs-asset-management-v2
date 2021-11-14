import React, { useEffect, useState } from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";

import "./ChangePassword.css";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { post } from "../../../httpHelper";

const eye = <BsFillEyeFill size={22} />;
const eyeSlash = <BsFillEyeSlashFill size={22} />;

const ChangePassword = ({ isOpenModel }) => {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isDisabled, setIsDisable] = useState(true);
  const [success, setSuccess] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const [newPasswordShown, setNewPasswordShown] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState();
  const [newPasswordError, setNewPasswordError] = useState();

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };
  const toggleNewPasswordVisiblity = () => {
    setNewPasswordShown(newPasswordShown ? false : true);
  };

  useEffect(() => {
    if (newPassword.length > 0 && oldPassword.length > 0)
      setIsDisable(false);
    else setIsDisable(true);
  }, [newPassword, oldPassword]);

  const handleSubmit = () => {
    post('/auth/password', {
      "oldPassword": oldPassword,
      "newPassword": newPassword
    })
      .then((res) => {
        if (res.data) {
          setSuccess(true);
        } else {
          setOldPasswordError('Password is incorrect')
        }
      })
      .catch((error) => {
        setNewPasswordError('Password must be from 8 to 36 characters!')
        console.error(error)
      })
  }

  return (
    <>
      <div id="Change-password">
        <div id="changepassword-form">
          {success ?
            <Form>
              <FormGroup className="changepass-data">
                <p>Your password has been changed successfully!</p>
              </FormGroup>
              <FormGroup className="close-btn">
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => isOpenModel(false)}>
                  Close
                </Button>
              </FormGroup>
            </Form> :
            <Form>
              <FormGroup className="changepass-data">
                <Label className="changpass-label" htmlFor="oldPassword">
                  Old Password
                </Label>
                <Input
                  className="changepass-input"
                  type={passwordShown ? "text" : "password"}
                  name="oldPassword"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                />
                <i className="show-password" onClick={() => togglePasswordVisiblity()}>
                  {passwordShown ? eye : eyeSlash}
                </i>
              </FormGroup>
              {oldPasswordError && (
                <p style={{ paddingLeft: '8em', color: 'red' }}>{oldPasswordError}</p>
              )}

              <FormGroup className="changepass-data">
                <Label className="changpass-label" htmlFor="newPassword">
                  New Password
                </Label>
                <Input
                  className="changepass-input"
                  type={newPasswordShown ? "text" : "password"}
                  name="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required={newPasswordShown.length > 0}
                />
                <i className="show-password" onClick={() => toggleNewPasswordVisiblity()}>
                  {newPasswordShown ? eye : eyeSlash}
                </i>
              </FormGroup>
              {newPasswordError && (
                <p style={{ paddingLeft: '8em', color: 'red' }}>{newPasswordError}</p>
              )}
              <FormGroup className="changepass-btn">
                <Button
                  type="button"
                  color="danger"
                  disabled={isDisabled}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  className="btn-cancel-logout"
                  onClick={() => isOpenModel(false)}>
                  Cancel
                </Button>
              </FormGroup>
            </Form>
          }
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
