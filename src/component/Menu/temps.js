import React, { useState } from "react";
import { ListGroup, ListGroupItem } from 'reactstrap';
import logo from '../../assets/Logo_lk.png';
import '../../App.css';
import "./Menu.css";
import authService from "../../services/auth.service";
import { Link } from "react-router-dom";

function Menu({ tableTab }) {
  const [selected, setSelected] = useState(null);
  const user = authService.getCurrentUser() ? authService.getCurrentUser() : ''

  function setSelectedItem(index) {
    setSelected(index)
    tableTab(index)
    localStorage.setItem("selected", index)
  }

  if (selected === null) {
    const index = localStorage.getItem('selected') ? parseInt(localStorage.getItem('selected')) : 1
    setSelectedItem(index)
  }

  return (
    <div className="menu">
      <img
        src={logo}
        className="menu-image"
      />
      <h3 className="menu-title">Online Asset Management</h3>
      <ListGroup className="menu-list">
        <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(1)} active={selected === 1}>
          <Link to='/home' className="menu-item__link">Home</Link>
        </ListGroupItem>
        <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(9)} active={selected === 9}>
          <Link to='/messenger' className="menu-item__link">Messenger</Link>
        </ListGroupItem>
        <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(7)} active={selected === 7}>
          <Link to='/request-assign' className="menu-item__link">
            Request for Assigning
          </Link>
        </ListGroupItem>
        {
          user.role === 'ROLE_ADMIN' ?
            <>
              <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(2)} active={selected === 2}>
                <Link to='/manage-user' className="menu-item__link">Manage User</Link>
              </ListGroupItem>
              <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(3)} active={selected === 3}>
                <Link to='/manage-asset' className="menu-item__link">Manage Asset</Link>
              </ListGroupItem>
              {/* <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(7)} active={selected === 7}>
                <Link to='/request-assign' className="menu-item__link">Request for Assigning</Link>
              </ListGroupItem> */}
              <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(4)} active={selected === 4}>
                <Link to='/manage-assignment' className="menu-item__link">Manage Assignment</Link>
              </ListGroupItem>
              <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(5)} active={selected === 5}>
                <Link to='/request-return' className="menu-item__link">Request for Returning</Link>
              </ListGroupItem>
              <ListGroupItem className="menu-item" action onClick={() => setSelectedItem(8)} active={selected === 8}>
                <Link to='/manage-repair' className="menu-item__link">Manage Repair</Link>
              </ListGroupItem>
              <ListGroupItem className="menu-item menu-item-report" action onClick={() => setSelectedItem(6)} active={selected === 6}>
                <Link to='/report/overview' className="menu-item__link ">
                  Report
                </Link>
                <div className="sub-menu">
                  <ul className="report-list">
                    <li className="report-item">
                      <Link to='/report/overview' className="menu-item__link">
                        Overview
                      </Link>
                    </li>
                    <li className="report-item">
                      <Link to='/report/assigned-assignments' className="menu-item__link">
                        Assigned Assignments
                      </Link>
                    </li>
                  </ul>
                </div>
              </ListGroupItem>
            </>
            :
            <></>
        }
      </ListGroup>
    </div >
  );
}

export default Menu;