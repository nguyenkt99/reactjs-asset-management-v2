import './home.css';
import ReturnImage from '../../assets/return_icon.png'
import ReturnAssignImage from '../../assets/request_assign_icon.png'
import AssignmentImage from '../../assets/assignment_icon.png'
import React, { useEffect, useState } from 'react';
import {
  Collapse, Navbar, Nav, NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu,
  DropdownItem, Input, FormGroup, Label, Row, Col, Button, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { MdNotifications } from "react-icons/md";
import { Redirect, Route, Switch, useHistory, Link, useRouteMatch } from 'react-router-dom';
import { get } from '../../httpHelper';
import authService from '../../services/auth.service';
import { EndPointRedirect } from '../../EndPointRedirect';
import Menu from '../Menu/index';
import UserAssignment from '../User/home'
import ListUser from '../Admin/component/ManageUser/ListUser'
import EditUser from '../Admin/component/ManageUser/EditUser'
import CreateUser from '../Admin/component/ManageUser/CreateUser'
import ManagerAsset from '../Admin/component/ManageAsset/ListAsset'
import CreateAsset from "../Admin/component/ManageAsset/CreateAsset";
import EditAsset from '../Admin/component/ManageAsset/EditAsset'
import ManagerAssignment from '../Admin/component/ManageAssignment/ListAssignment'
import CreateAssignment from '../Admin/component/ManageAssignment/CreateAssignment'
import EditAssignment from '../Admin/component/ManageAssignment/EditAssignmnet'
import RequestReturn from '../Admin/component/RequestReturn';
import RequestForAssigning from '../Admin/component/RequestAssign';
import Overview from '../Admin/component/Report/Overview';
import AssignedAssignments from '../Admin/component/Report/AssignedAssignments';
import ChangePassword from '../User/ChangePassword'
import RequestAssignUser from '../User/RequestAssignUser';
import CreateRequestAssign from '../User/CreateRequestAssign';
import EditRequestAssign from '../User/EditRequestAssign';
import { AppContext } from '../../Context/AppProvider';
import { Toast, ToastContainer } from 'react-bootstrap';
import moment from 'moment';
import { db } from '../../firebase/config';
import ManageRepair from '../Admin/component/ManageRepair';
import ChatMessage from '../ChatMessage';

function Home() {
  const history = useHistory();
  const user = authService.getCurrentUser() ? authService.getCurrentUser() : ''
  const { location } = history;
  const [isOpen, setIsOpen] = useState(false);
  const [navbarName, setnavbarName] = useState('');
  const [modal, setModal] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const toggleModal = () => setModal(!modal);

  const [modalpw, setModalpw] = useState(false);
  const toggleModalpw = () => setModalpw(!modalpw);

  const [modalProfile, setModalProfile] = useState(false);
  const toggleModalProfile = () => setModalProfile(!modalProfile);

  const [profile, setProfile] = useState();
  // const [notifications, setNotifications] = useState([])

  // context
  const { showToastNotify, setShowToastNotify, notifications, clickedNotify, setClickedNotify } = React.useContext(AppContext);

  useEffect(() => {
    // EndPointRedirect();
    if (!authService.getCurrentUser())
      handleLogout()
  }, []);

  const handleShowProfile = () => {
    get('/user/profile')
      .then((response) => {
        setProfile(response.data);
        toggleModalProfile();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleLogout() {
    authService.logout();
    history.push('/login');
  }

  let path
  if (location.pathname.includes('home')) {
    path = "Home"
  } else if (location.pathname.includes('messenger')) {
    path = "Messenger"
  } else if (location.pathname.includes('assigns')) {
    path = "Request for Assigning"
  } else if (location.pathname.includes('user')) {
    path = "Manage User"
    if (location.pathname.includes('users/create'))
      path += " > Create User";
    else if (location.pathname.includes('users/SD'))
      path += " > Edit User";
  } else if (location.pathname.includes('assets')) {
    path = "Manage Asset"
    if (location.pathname.includes('assets/create'))
      path += " > Create Asset";
    else if (location.pathname.includes('assets/'))
      path += " > Edit Asset";
  } else if (location.pathname.includes('/assignments')) {
    path = "Manage Assignment"
    if (location.pathname.includes('assignments/create'))
      path += " > Create Assignment";
    else if (location.pathname.includes('assignments/'))
      path += " > Edit Assignment";
  } else if (location.pathname.includes('returns')) {
    path = "Request for Returning"
  } else if (location.pathname.includes('repairs')) {
    path = "Manage Repair"
  } else if (location.pathname.includes('reports')) {
    path = "Report"
    if (location.pathname.includes('overview'))
      path += " > Overview";
    else if (location.pathname.includes('assigned-assignments'))
      path += " > Assigned Assignemts";
  }

  const handleSeen = (id) => {
    setClickedNotify(false)
    db.collection('notifications').doc(id).update({
      "isSeen": true
    })
  }

  return (
    <div className="Home">
      <Navbar expand="md" className="header__navbar">
        <div className="grid">
          <Collapse navbar>
            <Nav className="header__navbar-list">
              <div className="header__navbar-left">
                <NavItem className="header__navbar-title">
                  {path}
                </NavItem>
              </div>
              <div className="header__navbar-right">
                <NavItem className="nav-item--has-notify" >
                  <MdNotifications className="header__navbar-notify-icon" />
                  <div className="navbar__notify">
                    <header className="navbar__notify-header">
                      <h3>Notifications</h3>
                    </header>
                    <ul className="navbar__notify-list">
                      {notifications.map((n) => (
                        <li key={n.id} className={n?.isSeen ? "navbar__notify-item" : "navbar__notify-item navbar__notify-item--unviewed"}>
                          <Link className="navbar__notify-link" to={n.type === 'REQUEST_ASSIGN' ? '/request-assign' : n.type === 'ASSIGNMENT' ? '/manage-assignment' : '/request-return'} onClick={() => handleSeen(n.id)}>
                            <img src={n.type === 'REQUEST_ASSIGN' ? ReturnAssignImage
                              : n.type === 'REQUEST_RETURN' ? ReturnImage : AssignmentImage} alt="USB Kingston"
                              className="navbar__notify-img" />
                            <div className="navbar__notify-info">
                              <span className="navbar__notify-description">{n.title}</span>
                              <span className="navbar__notify-time">{moment.utc(n.createdDate.seconds * 1000).local().startOf('seconds').fromNow()}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <footer className="navbar__notify-footer">
                      <span href="" className="navbar__notify-footer-btn">View all</span>
                    </footer>
                  </div>
                </NavItem>
                <UncontrolledDropdown nav inNavbar className="header__navbar-user">
                  <DropdownToggle nav caret>
                    {user.username}
                  </DropdownToggle>
                  <DropdownMenu end className="header__navbar-user-menu">
                    <DropdownItem onClick={handleShowProfile}>Profile</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={toggleModalpw}>Change password</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={toggleModal}>Logout</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </Nav>
          </Collapse>
        </div>
      </Navbar >

      <div className="grid">
        <Row>
          <Col xs="2">
            <Menu />
          </Col>
          <Col xs="10">
            <div className="app-content">
              <Switch>
                <Route path="/messenger/:username" component={ChatMessage} />
                <Route path='/messenger' component={ChatMessage} />
                {/* <Route path={['/', '/home']} component={UserAssignment} /> */}
                <Route path="/home" component={UserAssignment} />
                {user.role === "ROLE_ADMIN" ?
                  <>
                    <Route path="/assigns" exact component={RequestForAssigning} />
                    <Route path="/users" exact component={ListUser} />
                    <Route path="/users/create" exact component={CreateUser} />
                    <Route path="/users/edit/:staffCode" exact component={EditUser} />
                    <Route path="/assets" exact component={ManagerAsset} />
                    <Route path="/assets/create" exact component={CreateAsset} />
                    <Route path="/assets/edit/:assetCode" exact component={EditAsset} />
                    <Route path="/assignments" exact component={ManagerAssignment} />
                    <Route path="/assignments/create" exact component={CreateAssignment} />
                    <Route path="/assignments/edit/:assignmentId" exact component={EditAssignment} />
                    <Route path="/returns" exact component={RequestReturn} />
                    <Route path="/repairs" exact component={ManageRepair} />
                    <Route path="/reports/overview" exact component={Overview} />
                    <Route path="/reports/assigned-assignments" exact component={AssignedAssignments} />
                  </>
                  :
                  user.role === "ROLE_STAFF" ?
                    <>
                      {console.log(user.role)}
                      <Route path="/assigns" exact={true} component={RequestAssignUser} />
                      <Route path="/assigns/create" exact={true} component={CreateRequestAssign} />
                      <Route path="/assigns/:requestId" exact={true} component={EditRequestAssign} />
                    </>
                    :
                    <Redirect to="/home" />
                }
              </Switch>
            </div>
          </Col>
        </Row>
      </div>


      {/* Modal profile */}
      <Modal centered isOpen={modalProfile} toggle={toggleModalProfile}>
        <ModalHeader className="modal-header-logout" toggle={toggleModalProfile}>Profile</ModalHeader>
        <ModalBody>
          <FormGroup row>
            <Label sm={4}>Staff Code</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.staffCode} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Full Name</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.fullName} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Username</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.username} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Date of Birth</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.dateOfBirth} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Email</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.email} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Gender</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.gender} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Joined Date</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.joinedDate} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Type</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && ROLEtoLowcase[profile.type]} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Department</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.deptName} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Location</Label>
            <Col sm={8}>
              <Input type="text" plaintext readOnly value={profile && profile.location} />
            </Col>
          </FormGroup>
        </ModalBody>
      </Modal>

      {/* Change password here */}
      <Modal className='changepass-modal' centered isOpen={modalpw} toggle={toggleModalpw}>
        <ModalHeader >
          <p >Change Password</p>
        </ModalHeader>
        <ModalBody>
          <ChangePassword isOpenModel={setModalpw} />
        </ModalBody>
      </Modal>

      {/* Modal logout */}
      <Modal style={{ width: '300px' }} centered isOpen={modal} toggle={toggleModal}>
        <ModalHeader className="modal-header-logout" >Are you sure?</ModalHeader>
        <ModalBody className="modal-body-logout">
          <p>Do you want to log out?</p>
          <Button color='danger' onClick={handleLogout}>
            Logout
          </Button>{' '}
          <Button className="btn-cancel-logout" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalBody>
      </Modal>

      {/* Toast notifications */}
      <ToastContainer className="m-4" position='bottom-end'>
        <Toast
          style={{ fontSize: '1.4rem' }}
          onClose={() => setShowToastNotify(false)}
          show={clickedNotify !== null ? false : showToastNotify}
          delay={7000}
          autohide
        >
          <Toast.Header>
            <strong className='me-auto'>{notifications.length > 0 && notifications[0].type}</strong>
            <small>{notifications.length > 0 && moment.utc(notifications[0].createdDate.seconds * 1000).local().startOf('seconds').fromNow()}</small>
          </Toast.Header>
          <Toast.Body>{notifications.length > 0 && notifications[0].title}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div >
  );
};
export default Home;

const ROLEtoLowcase = { ALL: 'All', ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff' }