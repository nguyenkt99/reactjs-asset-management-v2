import React from "react";
import logo from '../../assets/Logo_lk.png';
import '../../App.css';
import "./Menu.css";
import authService from "../../services/auth.service";
import { NavLink } from "react-router-dom";

function Menu() {
    const user = authService.getCurrentUser() ? authService.getCurrentUser() : ''
    const menus = [
        {
            label: 'Home',
            to: '/home',
            exact: true,
            isUser: true
        },
        {
            label: 'Messenger',
            to: '/messenger',
            exact: false,
            isUser: true
        },
        {
            label: 'Manage User',
            to: '/users',
            exact: false
        },
        {
            label: 'Manage Asset',
            to: '/assets',
            exact: false
        },
        {
            label: 'Request for Assigning',
            to: '/assigns',
            exact: false,
            isUser: true
        },
        {
            label: 'Manage Assignment',
            to: '/assignments',
            exact: false
        },
        {
            label: 'Request for Returning',
            to: '/returns',
            exact: false
        },
        {
            label: 'Manage Repair',
            to: '/repairs',
            exact: false
        },
        {
            label: 'Report',
            to: '/reports',
            exact: false,
            subMenus: [
                {
                    label: 'Overview',
                    to: '/reports/overview',
                    exact: true,
                },
                {
                    label: 'Assigned Assignments',
                    to: '/reports/assigned-assignments',
                    exact: true,
                }
            ]
        },
    ]

    const MenuLink = ({ label, to, exact, isSubMenu = false, children }) => {
        return (
            <li key={to} className={isSubMenu ? 'menu-item menu-item-report' : 'menu-item'}>
                <NavLink to={to} exact={exact}>
                    {label}
                </NavLink>
                {children}
            </li>
        )
    }

    const SubMenuLink = ({ label, to }) => {
        return <>
            <li key={to} className="menu-item">
                <NavLink to={to} className="menu-item__link">
                    {label}
                </NavLink>
            </li>

        </>
    }


    return (
        <div className="menu">
            <img src={logo} className="menu-image" alt="logo" />
            <h3 className="menu-title">Online Asset Management</h3>
            <ul className="menu-list">
                {user.role === 'ROLE_ADMIN' ?
                    menus.map(m => {
                        if (!m.subMenus) {
                            return <MenuLink label={m.label} to={m.to} exact={m.exact}/>
                        } else {
                            return <>
                                <MenuLink label={m.label} to={m.to} exact={m.exact} isSubMenu={true}>
                                    <div className="sub-menu">
                                        <ul className="report-list">
                                            {m.subMenus.map(s => (
                                                <SubMenuLink label={s.label} to={s.to} />
                                            ))}
                                        </ul>
                                    </div>
                                </MenuLink>
                            </>
                        }

                    })
                    :
                    menus.filter(m => m.isUser).map(m => {
                        return <MenuLink label={m.label} to={m.to} />
                    })

                }
            </ul>
        </div >
    );
}

export default Menu;