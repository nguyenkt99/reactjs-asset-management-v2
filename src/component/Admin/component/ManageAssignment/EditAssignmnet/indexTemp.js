import React, { useEffect, useState, useRef } from 'react'
import { Row, Col, Form, Button, Spinner, Modal, Table } from 'react-bootstrap'
import { Link, useHistory, withRouter } from 'react-router-dom';
import { get, put } from '../../../../../httpHelper'
import { FaSearch, FaAngleDown, FaCalendarAlt } from 'react-icons/fa';
import { CgCloseO } from 'react-icons/cg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function EditAssignment(props) {
    const [users, setusers] = useState([])
    const [userDisplay, setuserDisplay] = useState(false)
    const [user, setuser] = useState({ fullName: '', staffCode: '' })
    const [assetDisplay, setassetDisplay] = useState(false)
    const [selectedAssets, setSelectedAssets] = useState([])
    const [assets, setAssets] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [assetCodeASC, setAssetCodeASC] = useState(true);
    const [assetNameASC, setAssetNameASC] = useState(false);
    const [categoryASC, setCategoryASC] = useState(false);
    const [staffCodeASC, setStaffCodeASC] = useState(false)
    const [fullNameASC, setFullNameASC] = useState(true)
    const [typeASC, setTypeASC] = useState(false)
    const [usersData, setusersData] = useState([])
    const [availableAssetsData, setAvailableAssetsData] = useState([])
    // check ok or cancel 
    const [selectingUser, setSelectingUser] = useState([])
    const [selectingAssets, setSelectingAssets] = useState([])
    // state
    const [assignedDate, setAssignedDate] = useState()
    const [returnedDate, setReturnedDate] = useState()
    const [assignment, setAssignment] = useState({ assignedDate: '' })
    const [isOpenDatePickerAd, setIsOpenDatePickerAd] = useState(false);
    const [isOpenDatePickerRd, setIsOpenDatePickerRd] = useState(false)

    //note
    const [note, setNote] = useState('')
    let history = useHistory()

    useEffect(() => {
        fetchAssets()
        fetchAssigment()
    }, [])

    useEffect(() => {
        fetchAvailableAssets()
    }, [assignedDate, returnedDate])

    //useeffect after setAssignment
    const isInitialMount = useRef(true)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
        } else {
            fetchUsers()
            // fetchAvailableAssets()
            let assignedDate = assignment.assignedDate.split("/").reverse().join("-")
            let intendedReturnDate = assignment.intendedReturnDate.split("/").reverse().join("-")
            setAssignedDate(assignedDate)
            setReturnedDate(intendedReturnDate)
            setNote(assignment.note)
            let oldAssets = [];
            assignment.assignmentDetails.forEach(ad => {
                const foundAsset = assets.find(a => a.assetCode === ad.assetCode)
                if (foundAsset) {
                    oldAssets.push(foundAsset)
                }
            })
            setSelectingAssets(oldAssets)
            setSelectedAssets(oldAssets)
        }
    }, [assignment])

    useEffect(() => {
        selectedAssets.forEach(a => {
            if (document.getElementById(a.assetCode) !== null)
                document.getElementById(a.assetCode).checked = true;
        })
    }, [selectedAssets])

    //useeffect use for sort and search
    useEffect(() => {
        setusersData(users)
        setAvailableAssetsData(assets)
    }, [users, assets])

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = {
            assignedTo: user.username,
            note: e.target.note.value,
            assignedDate: assignedDate.split("-").reverse().join("/"),
            intendedReturnDate: returnedDate.split("-").reverse().join("/"),
            assignmentDetails: selectedAssets.map(a => ({ assetCode: a.assetCode }))
        }

        setIsSaving(true);
        put(`/assignment/${assignment.id}`, formData)
            .then((res) => {
                history.push({
                    pathname: '/manage_assignment',
                    state: {
                        id: res.data.id
                    }
                });
            })
            .catch((error) => {
                setIsSaving(false);
                console.log(error.response);
            })
    }

    const fetchUsers = () => {
        get('/users').then(response => {
            if (response.status === 200) {
                setusers(response.data)
                let currentUser = response.data.filter((data) => {
                    return data.username === assignment.assignedTo
                })
                setuser(currentUser[0])
                setSelectingUser(currentUser[0])
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const id = props.match.params.assignmentId
    const fetchAssigment = () => {
        get(`/assignment/${id}`)
            .then((res) => {
                if (res.data.state !== "WAITING_FOR_ACCEPTANCE")
                    history.push('/manage_assignment')

                setAssignment(res.data)
            })
            .catch((err) => {
                console.log(err.response)
            })
    }

    // const fetchAvailableAssets = () => {
    //     get('/asset').then(response => {
    //         if (response.status === 200) {
    //             let available = response.data.filter((data) => {
    //                 return data.state === "AVAILABLE" || data.assetCode === assignment.assetCode;
    //             })
    //             setAvailableAssets(available)
    //             let currentAsset = response.data.filter((data) => {
    //                 return data.assetCode === assignment.assetCode;
    //             })
    //             setasset(currentAsset[0]);
    //             setSelectingAssets(currentAsset[0]);
    //         } else {
    //             alert('Something wrong!')
    //         }
    //     }).catch(error => console.log(error.response))
    //     // handleSortAsset(ASSET_SORT_BY.FullName)
    // }

    const fetchAssets = () => {
        get(`/asset`).then(response => {
            if (response.status === 200) {
                setAssets(response.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const fetchAvailableAssets = () => {
        get(`/asset/available?assignmentId=${id}&startDate=${assignedDate}&endDate=${returnedDate}`).then(response => {
            if (response.status === 200) {
                setAvailableAssets(response.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const handleUserDisplay = () => {
        if (assetDisplay === true) setassetDisplay(false)
        if (userDisplay === false) setuserDisplay(true);
    }

    const handleAssetDisplay = () => {
        if (userDisplay === true) setuserDisplay(false);
        if (assetDisplay === false) setassetDisplay(true);
    }

    const handleCancel = () => {
        setuserDisplay(false);
        setassetDisplay(false);
        // setSelectingAssets(null);
        // setSelectingUser(null);
        //user
        if (document.getElementById(user.staffCode))
            document.getElementById(user.staffCode).checked = true;
        else
            users.forEach((u) => {
                if (document.getElementById(u.staffCode))
                    document.getElementById(u.staffCode).checked = false;
            })
        //asset
        // if (document.getElementById(asset.assetCode) !== null)
        //     document.getElementById(asset.assetCode).checked = true;
        // else
        //     assets.forEach((u) => {
        //         if (document.getElementById(u.assetCode))
        //             document.getElementById(u.assetCode).checked = false;
        //     })
    }

    const handleOk = () => {
        if (selectingUser !== null) setuser(selectingUser);
        if (selectingAssets !== null) setSelectedAssets(selectingAssets)

        if (selectingAssets !== null) setSelectedAssets(selectingAssets);
        setuserDisplay(false);
        setassetDisplay(false);
    }

    //on change radio 
    const userChange = (e) => {
        let staffCode = e.target.value;
        let u = users.filter((u) => {
            return u.staffCode === staffCode
        })
        console.log(staffCode);
        document.getElementById(staffCode).checked = true;
        setSelectingUser(u[0]);
    }

    //on change radio
    const assetChange = (e) => {
        const assetCode = e.target.value;
        const asset = assets.find(a => a.assetCode === assetCode)
        if (selectingAssets.find(a => a.assetCode === assetCode)) {
            setSelectingAssets([...selectingAssets.filter(a => a.assetCode !== assetCode)])
        } else {
            setSelectingAssets([...selectingAssets, asset])
        }
    }

    const handleSearchChangeUser = (e) => {
        let keySearch = e.target.value;
        let newData = users.filter(e => (
            e.staffCode.toLowerCase().includes(keySearch.toLowerCase())
            || e.fullName.toLowerCase().includes(keySearch.toLowerCase())))
        setusersData(newData);
    }

    const handleSearchChangeAsset = (e) => {
        let keySearch = e.target.value;
        let newData = assets.filter(e => (
            e.assetCode.toLowerCase().includes(keySearch.toLowerCase())
            || e.assetName.toLowerCase().includes(keySearch.toLowerCase())
        ))
        setAvailableAssetsData(newData);
    }

    const openDatePickerAd = () => {
        setIsOpenDatePickerAd(!isOpenDatePickerAd);
    }

    const openDatePickerRd = () => {
        setIsOpenDatePickerRd(!isOpenDatePickerRd)
    }

    const saveButton = () => {
        if (isSaving)
            return <Button variant="danger" type="submit" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
        else if (selectedAssets.length !== 0 && user.fullName !== '')
            return <Button variant="danger" type="submit">Save</Button>
        return <Button variant="danger" type="submit" disabled>Save</Button>;
    }

    const handleSortAsset = (key) => {
        let reverse = -1;
        let list = [];
        if (key === ASSET_SORT_BY.AssetCode) {
            reverse = assetCodeASC ? -1 : 1;
            setAssetCodeASC(!assetCodeASC);
            list = availableAssetsData
                .slice()
                .sort((a, b) =>
                    a.assetCode > b.assetCode
                        ? 1 * reverse
                        : b.assetCode > a.assetCode
                            ? -1 * reverse
                            : 0
                );
        } else if (key === ASSET_SORT_BY.AssetName) {
            reverse = assetNameASC ? -1 : 1;
            setAssetNameASC(!assetNameASC);
            list = availableAssetsData
                .slice()
                .sort((a, b) =>
                    a.assetName > b.assetName
                        ? 1 * reverse
                        : b.assetName > a.assetName
                            ? -1 * reverse
                            : 0
                );
        } else if (key === ASSET_SORT_BY.Category) {
            reverse = categoryASC ? -1 : 1;
            setCategoryASC(!categoryASC);
            list = availableAssetsData
                .slice()
                .sort((a, b) =>
                    a.categoryName > b.categoryName
                        ? 1 * reverse
                        : b.categoryName > a.categoryName
                            ? -1 * reverse
                            : 0
                );
        }
        setAvailableAssetsData(list);
    };

    const handleSortUser = (key) => {
        let reverse = -1;
        let list = []
        if (key === USER_SORT_BY.StaffCode) {
            reverse = staffCodeASC ? -1 : 1;
            setStaffCodeASC(!staffCodeASC)
            list = usersData.slice().sort((a, b) => (a.staffCode > b.staffCode) ? 1 * reverse : ((b.staffCode > a.staffCode) ? -1 * reverse : 0))
        }
        else if (key === USER_SORT_BY.FullName) {
            reverse = fullNameASC ? -1 : 1;
            setFullNameASC(!fullNameASC)
            list = usersData.slice().sort((a, b) => (a.fullName > b.fullName) ? 1 * reverse : ((b.fullName > a.fullName) ? -1 * reverse : 0))
        }
        else if (key === USER_SORT_BY.Type) {
            reverse = typeASC ? -1 : 1;
            setTypeASC(!typeASC)
            list = usersData.slice().sort((a, b) => (a.type > b.type) ? 1 * reverse : ((b.type > a.type) ? -1 * reverse : 0))
        }
        setusersData(list);
    }

    // const getMinDate = (assignedDate) => {
    //     const currentDate = new Date();
    //     return assignedDate > currentDate ? currentDate : assignedDate;
    // }

    let userJsx =
        <Row>
            <Col sm={3}>
                <div className='user_asset_area'>
                    <div className='label_user'>
                        <span>User</span>
                    </div>
                </div>
            </Col>
            <Col className="user_area" onClick={handleUserDisplay}>
                <div className="input_field">
                    <div className="border_search_info">
                        {user.fullName}
                        <FaSearch className="fa-search" />
                    </div>
                </div>
                <Modal.Dialog className="dialog" style={{ display: userDisplay ? 'block' : 'none' }}>
                    <Modal.Body style={{ padding: "0px" }}>
                        <div className="list_select">
                            <Row className="header_select">
                                <Col className="label_select reset"><span className="c-red title">Select User</span></Col>
                                <Col className="search_select reset">
                                    <input onChange={handleSearchChangeUser}>

                                    </input>
                                    <div className="fa-header">
                                        <FaSearch className=""></FaSearch>
                                    </div>

                                </Col>
                            </Row>
                            <Row className="table_ua" >
                                <Table >
                                    <thead className="fix_width">
                                        <tr className="fix_width">
                                            <th>
                                            </th>
                                            <th style={{ width: "115px" }} onClick={() => handleSortUser(USER_SORT_BY.StaffCode)}>
                                                Staff Code
                                                <FaAngleDown />
                                            </th>
                                            <th onClick={() => handleSortUser(USER_SORT_BY.FullName)}>
                                                Full Name
                                                <FaAngleDown />
                                            </th>
                                            <th onClick={() => handleSortUser(USER_SORT_BY.Type)}>
                                                Type
                                                <FaAngleDown />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-content fix_width">
                                        {usersData.map((u) => {
                                            return <tr key={u.staffCode} className="fix_width">
                                                <td style={{ width: "20px" }} >
                                                    <input
                                                        id={u.staffCode}
                                                        type="radio"
                                                        // id = {u.staffCode} 
                                                        name="staff_radio"
                                                        value={u.staffCode}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={userChange}
                                                        className="radio_custom"
                                                        defaultChecked={u.username === user.username}
                                                    ></input>
                                                </td>
                                                <td style={{ width: "115px" }} >{u.staffCode}</td>
                                                <td style={{ width: "170px" }} >{u.fullName}</td>
                                                <td>{u.type === "ROLE_ADMIN" ? "Admin" : "Staff"}</td>

                                            </tr>
                                        })}
                                    </tbody>
                                    <Col className="button-group">
                                        <Button variant='danger' style={{ padding: "0px 19px" }} onClick={handleOk} >
                                            Save
                                        </Button>
                                        <Button variant="outline-secondary"
                                            style={{ marginLeft: '20px' }}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </Col>
                                </Table>
                            </Row>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Col>
        </Row>

    let assetJsx =
        <Row>
            <Col sm={3}>
                <div className='user_asset_area'>
                    <div className='label_asset'>
                        <span>Asset</span>
                    </div>
                </div>
            </Col>
            <Col className="asset_area" onClick={handleAssetDisplay}>
                <div className="input_field">
                    <div className="border_search_info">
                        <FaSearch className="fa-search" />
                    </div>
                </div>
                <Modal.Dialog className="dialog" style={{ display: assetDisplay ? 'block' : 'none' }}>
                    <Modal.Body style={{ padding: "0px" }}>
                        <div className="list_select">
                            <Row className="header_select">
                                <Col className="label_select reset"><span className="c-red title">Select Asset</span></Col>
                                <Col className="search_select reset">
                                    <input onChange={handleSearchChangeAsset}>

                                    </input>
                                    <div className="fa-header">
                                        <FaSearch className=""></FaSearch>
                                    </div>

                                </Col>
                            </Row>
                            <Row className="table_ua" >
                                <Table >
                                    <thead className="fix_width">
                                        <tr className="fix_width">
                                            <th>
                                            </th>
                                            <th style={{ width: "115px" }} onClick={() => handleSortAsset(ASSET_SORT_BY.AssetCode)}>
                                                Asset Code
                                                <FaAngleDown />
                                            </th>
                                            <th onClick={() => handleSortAsset(ASSET_SORT_BY.AssetName)}>
                                                Asset Name
                                                <FaAngleDown />
                                            </th>
                                            <th onClick={() => handleSortAsset(ASSET_SORT_BY.Category)}>
                                                Category
                                                <FaAngleDown />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-content fix_width">
                                        {availableAssetsData.map((a) => {
                                            return <tr key={a.assetCode} className="fix_width">
                                                <td style={{ width: "20px" }} >
                                                    <input
                                                        id={a.assetCode}
                                                        type="checkbox"
                                                        name="assetCheckbox"
                                                        value={a.assetCode}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={assetChange}
                                                        defaultChecked={a.assetCode === assignment.assetCode}
                                                    // className="radio_custom"
                                                    ></input>
                                                </td>
                                                <td style={{ width: "115px" }} >{a.assetCode}</td>
                                                <td style={{ width: "170px" }} >{a.assetName}</td>
                                                <td>{a.categoryName}</td>

                                            </tr>
                                        })}
                                    </tbody>
                                    <Col className="button-group">
                                        <Button variant='danger' style={{ padding: "0px 19px" }} onClick={handleOk} >
                                            Save
                                        </Button>
                                        <Button variant="outline-secondary"
                                            style={{ marginLeft: '20px' }}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </Col>
                                </Table>
                            </Row>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Col>
        </Row>

    return (
        <>
            <h3 className="content-title">Edit Assignment</h3>
            <Col xs={6}>
                <Form className="content-form" onSubmit={handleSubmit}>
                    <Form.Group as={Row} className='mb-3' required controlId='installedDate'>
                        <Form.Label column sm={3}>
                            Assigned Date
                        </Form.Label>
                        <Col>
                            <div className="datepicker">
                                <DatePicker className="form-control"
                                    dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                                    onKeyDown={(e) => e.preventDefault()}
                                    selected={assignedDate && new Date(assignedDate)}
                                    onChange={(date) => setAssignedDate(moment(date).format('YYYY-MM-DD'))}
                                    // minDate={getMinDate(new Date(assignment.assignedDate.split("/").reverse().join("-")))}
                                    minDate={new Date()}
                                    onClickOutside={openDatePickerAd}
                                    onSelect={openDatePickerAd}
                                    onFocus={openDatePickerAd}
                                    open={isOpenDatePickerAd}
                                />
                                <FaCalendarAlt className="icon-date" onClick={openDatePickerAd} />
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group
                        as={Row} className='mb-3' required controlId='installedDate'>
                        <Form.Label column sm={3}>
                            Returned Date
                        </Form.Label>
                        <Col>
                            <div className="datepicker">
                                <DatePicker className="form-control"
                                    dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                                    onKeyDown={(e) => e.preventDefault()}
                                    selected={returnedDate && new Date(returnedDate)}
                                    onChange={(date) => setReturnedDate(moment(date).format('YYYY-MM-DD'))}
                                    minDate={new Date()}
                                    onClickOutside={openDatePickerRd}
                                    onSelect={openDatePickerRd}
                                    onFocus={openDatePickerRd}
                                    open={isOpenDatePickerRd}
                                />
                                <FaCalendarAlt className="icon-date" onClick={openDatePickerRd} />
                            </div>
                        </Col>
                    </Form.Group>
                    {userJsx}
                    {assetJsx}
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                        </Form.Label>
                        <Col>
                            {selectedAssets.map((a) =>
                                <div className="asset-item" key={a.assetCode}>
                                    <span key={a.assetCode}>{a.assetName} ({a.assetCode})</span>
                                    <CgCloseO className="asset-icon-remove" />
                                </div>
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control
                                name='note'
                                as='textarea'
                                maxLength={100}
                                defaultValue={assignment.note}
                                // minLength={20}
                                value={note}
                                onChange={(e) => { setNote(e.target.value) }}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="float-end mb-3">
                        <Col>
                            {saveButton()}
                            <Link className="btn btn-outline-secondary" style={{ marginLeft: "40px" }} to="/manage_assignment">Cancel</Link>
                        </Col>
                    </Form.Group>
                </Form>
            </Col>
        </>
    )
}

const ASSET_SORT_BY = {
    AssetCode: 'AssetCode',
    AssetName: 'AssetName',
    Category: 'Category',
    State: 'State',
};

const USER_SORT_BY = {
    StaffCode: 'staffCode',
    FullName: 'fullName',
    Username: 'username',
    JoinedDate: 'joinedDate',
    Type: 'type',
}

export default withRouter(EditAssignment);