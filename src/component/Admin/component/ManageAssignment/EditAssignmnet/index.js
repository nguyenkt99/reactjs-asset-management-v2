import React, { useEffect, useState, useRef } from 'react'
import { Row, Col, Form, Button, Spinner, Modal, Table, Badge } from 'react-bootstrap'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { get, put } from '../../../../../httpHelper'
import { FaSearch, FaAngleDown, FaCalendarAlt } from 'react-icons/fa'
import { CgCloseO } from 'react-icons/cg'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import moment from "moment"
import ModalNotification from '../../../../ModalNotification'
import { normalizeString, removeAccents } from '../../../../../utils/StringNormalize'

function EditAssignment(props) {
    const [users, setUsers] = useState([])
    const [userDisplay, setUserDisplay] = useState(false)
    const [selectedUser, setSelectedUser] = useState()
    const [assets, setAssets] = useState([])
    const [availableAssets, setAvailableAssets] = useState([])
    const [assetDisplay, setAssetDisplay] = useState(false)
    const [selectedAssets, setSelectedAssets] = useState([])
    const [assetCodeASC, setAssetCodeASC] = useState(true)
    const [assetNameASC, setAssetNameASC] = useState(false)
    const [categoryASC, setCategoryASC] = useState(false)
    const [staffCodeASC, setStaffCodeASC] = useState(false)
    const [fullNameASC, setFullNameASC] = useState(true)
    const [typeASC, setTypeASC] = useState(false)
    const [usersData, setUsersData] = useState([])
    const [availableAssetsData, setAvailableAssetsData] = useState([])
    // check ok or cancel 
    const [selectingUser, setSelectingUser] = useState()
    const [selectingAssets, setSelectingAssets] = useState([])
    // state
    const [note, setNote] = useState('')
    const [assignedDate, setAssignedDate] = useState()
    const [returnedDate, setReturnedDate] = useState()
    const [assignment, setAssignment] = useState()
    const [isOpenDatePickerAd, setIsOpenDatePickerAd] = useState(false)
    const [isOpenDatePickerRd, setIsOpenDatePickerRd] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [fullAccess, setFullAccess] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [showModalError, setShowModalError] = useState(false)

    const history = useHistory()
    const match = useRouteMatch()

    useEffect(() => {
    const promise = new Promise((resovle) => {
            resovle()
        })

        promise
            .then(() => {
                return fetchAssets()
            })
            .then(() => {
                return fetchAssigment()
            })
    }, [])


    // useEffect(() => {
    //     fetchAvailableAssets()
    // }, [assignedDate, returnedDate])

    //useeffect after setAssignment
    const isMounted = useRef(true)
    useEffect(() => {
        if (isMounted.current) {
            isMounted.current = false
        } else {
            let oldAssets = []
            assignment.assignmentDetails.forEach(ad => {
                const asset = assets.find(a => a.assetCode === ad.assetCode)
                if (asset) {
                    oldAssets.push(asset)
                }
            })

            fetchUsers()
            setSelectingAssets(oldAssets)
            setSelectedAssets(oldAssets)
            setNote(assignment.note)
            setAssignedDate(assignment.assignedDate.split("/").reverse().join("-"))
            setReturnedDate(assignment.intendedReturnDate.split("/").reverse().join("-"))

            if (assignment.assignmentDetails.some(ad => ad.state === 'ACCEPTED')) {
                setFullAccess(false)
            }
        }
    }, [assignment])

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = {
            assignedTo: selectedUser.username,
            note: note,
            assignedDate: assignedDate.split("-").reverse().join("/"),
            intendedReturnDate: returnedDate.split("-").reverse().join("/"),
            assignmentDetails: selectedAssets.map(a => ({ assetCode: a.assetCode }))
        }

        setIsSaving(true);
        put(`/assignment/${assignment.id}`, formData)
            .then((res) => {
                history.push({
                    pathname: '/assignments',
                    state: {
                        id: res.data.id
                    }
                });
            })
            .catch((error) => {
                setIsSaving(false);
                setErrorMessage(error?.response?.data?.message)
                setShowModalError(true)
            })
    }

    const fetchUsers = () => {
        get('/user').then(res => {
            if (res.status === 200) {
                const user = res.data.find((u) => u.username === assignment.assignedTo)
                setSelectingUser(user)
                setSelectedUser(user)
                setUsers(res.data)
                setUsersData(res.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error))
    }

    const fetchAssigment = () => {
        return get(`/assignment/${match.params.assignmentId}`)
            .then((res) => {
                if (res.data.state !== "WAITING_FOR_ACCEPTANCE" && res.data.state !== "ACCEPTED") {
                    history.push('/manage-assignment')
                }
                setAssignment(res.data)

            })
            .catch((err) => {
                console.log(err.response)
            })
    }

    const fetchAssets = () => {
        return get(`/asset`).then(response => {
            if (response.status === 200) {
                setAssets(response.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const fetchAvailableAssets = () => {
        get(`/asset/available?assignmentId=${match.params.assignmentId}&startDate=${assignedDate}&endDate=${returnedDate}`).then(response => {
            if (response.status === 200) {
                setAvailableAssets(response.data)
                setAvailableAssetsData(response.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const handleUserDisplay = () => {
        if (fullAccess) {
            if (assetDisplay === true) setAssetDisplay(false)
            if (userDisplay === false) setUserDisplay(true)
        }
    }

    const handleAssetDisplay = () => {
        if (userDisplay === true) setUserDisplay(false)
        if (assetDisplay === false) {
            fetchAvailableAssets()
            setAssetDisplay(true)
        }
    }

    const handleCancel = () => {
        //user
        if (document.getElementById(selectedUser.staffCode))
            document.getElementById(selectedUser.staffCode).checked = true;
        else
            users.forEach((u) => {
                if (document.getElementById(u.staffCode))
                    document.getElementById(u.staffCode).checked = false;
            })

        //asset
        // if (document.getElementById(asset.assetCode))
        //     document.getElementById(asset.assetCode).checked = true;
        // else
        //     assets.forEach((u) => {
        //         if (document.getElementById(u.assetCode))
        //             document.getElementById(u.assetCode).checked = false;
        //     })

        // availableAssets.forEach((a) => {
        //     if (document.getElementById(a.assetCode) && selectedAssets.find(selectedAsset => selectedAsset.assetCode === a.assetCode))
        //         document.getElementById(a.assetCode).checked = true;
        //     else
        //         document.getElementById(a.assetCode).checked = false;
        // })

        setUserDisplay(false);
        setAssetDisplay(false);
        setSelectingAssets(selectedAssets);
        setSelectingUser(selectedUser);
    }

    const handleOk = () => {
        if (selectingUser !== null) setSelectedUser(selectingUser);
        if (selectingAssets !== null) setSelectedAssets(selectingAssets)
        setUserDisplay(false);
        setAssetDisplay(false);
    }

    //on change radio 
    const userChange = (e) => {
        let staffCode = e.target.value;
        let u = users.find(u => u.staffCode === staffCode)
        // document.getElementById(staffCode).checked = true
        setSelectingUser(u)
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
        let keySearch = removeAccents(normalizeString(e.target.value))
        let newData = users.filter(e => (
            e.staffCode.toLowerCase().includes(keySearch)
            || e.fullName.toLowerCase().includes(keySearch)))
        setUsersData(newData);
    }

    const handleSearchChangeAsset = (e) => {
        let keySearch = removeAccents(normalizeString(e.target.value))
        let newData = assets.filter(e => (
            e.assetCode.toLowerCase().includes(keySearch)
            || e.assetName.toLowerCase().includes(keySearch)
        ))
        setAvailableAssets(newData);
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
        else if (selectedAssets.length !== 0 && selectedUser)
            return <Button variant="danger" type="submit">Save</Button>
        return <Button variant="danger" type="submit" disabled>Save</Button>;
    }

    const handleSortAsset = (key) => {
        let reverse = -1;
        let list = [];
        if (key === ASSET_SORT_BY.AssetCode) {
            reverse = assetCodeASC ? -1 : 1;
            setAssetCodeASC(!assetCodeASC);
            list = availableAssets
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
            list = availableAssets
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
            list = availableAssets
                .slice()
                .sort((a, b) =>
                    a.categoryName > b.categoryName
                        ? 1 * reverse
                        : b.categoryName > a.categoryName
                            ? -1 * reverse
                            : 0
                );
        }
        setAvailableAssets(list);
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
        setUsersData(list);
    }

    const handleRemove = (assetCode) => {
        console.log(assetCode)
        setSelectedAssets([...selectedAssets.filter(a => a.assetCode !== assetCode)])
        setSelectingAssets([...selectedAssets.filter(a => a.assetCode !== assetCode)])
    }

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
                <div className="input_field" >
                    <div style={!fullAccess ? { backgroundColor: "#e9ecef", cursor: "default" } : {}} className="border_search_info">
                        {selectedUser && selectedUser.fullName}
                        <FaSearch className="fa-search" />
                    </div>
                </div>
                <Modal.Dialog className="dialog-select" style={{ display: userDisplay ? 'block' : 'none' }}>
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
                                                        defaultChecked={u.username === selectedUser.username}
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
                        <span>Asset List</span>
                    </div>
                </div>
            </Col>
            <Col className="asset_area" onClick={handleAssetDisplay}>
                <div className="input_field">
                    <div className="border_search_info">
                        <FaSearch className="fa-search" />
                    </div>
                </div>
                <Modal.Dialog className="dialog-select" style={{ display: assetDisplay ? 'block' : 'none' }}>
                    <Modal.Body style={{ padding: "0px" }}>
                        <div className="list_select">
                            <Row className="header_select">
                                <Col className="label_select reset"><span className="c-red title">Select Asset</span></Col>
                                <Col className="search_select reset">
                                    <input onChange={handleSearchChangeAsset} />
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
                                        {availableAssets.map((a) => {
                                            return <tr key={a.assetCode} className="fix_width">
                                                <td style={{ width: "20px" }} >
                                                    <input
                                                        id={a.assetCode}
                                                        className="checkbox_custom"
                                                        type="checkbox"
                                                        name="assetCheckbox"
                                                        value={a.assetCode}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={assetChange}
                                                        disabled={assignment?.assignmentDetails.some(ad => ad.assetCode === a.assetCode && ad.state !== 'WAITING_FOR_ACCEPTANCE')}
                                                        checked={selectingAssets.some(s => s.assetCode === a.assetCode)}
                                                    // defaultChecked={assignment?.assignmentDetails.some(ad => ad.assetCode === a.assetCode)}
                                                    // className="radio_custom"
                                                    ></input>
                                                </td>
                                                <td style={{ width: "115px" }} >{a.assetCode}</td>
                                                <td style={{ width: "170px" }} >{a.assetName}</td>
                                                <td>{a.categoryName}</td>
                                            </tr>
                                        })}
                                    </tbody>
                                </Table>
                                <Col className="button-group">
                                    <Button variant='danger' style={{ padding: "0px 19px" }} onClick={handleOk} >
                                        OK
                                    </Button>
                                    <Button variant="outline-secondary"
                                        style={{ marginLeft: '20px' }}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
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
                                    disabled={!fullAccess}
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
                                    disabled={!fullAccess}
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
                            <div className="selected-asset-list">
                                {selectedAssets.map((a) =>
                                    <div className="asset-item" key={a.assetCode}>
                                        <span key={a.assetCode}>{a.assetName} ({a.assetCode})
                                            {/* {(() => {
                                                const adState = assignment?.assignmentDetails.find(ad => ad.assetCode === a.assetCode)?.state
                                                if (!adState)
                                                    return <Badge bg="warning">New</Badge>
                                                if (adState === STATE.WAITING_FOR_RETURNING || adState === STATE.COMPLETED)
                                                    return <Badge bg="secondary">{StateToLowerCase[adState]}</Badge>
                                                else if (adState === STATE.ACCEPTED)
                                                    return <Badge bg="success">{StateToLowerCase[adState]}</Badge>
                                            })()} */}
                                        </span>
                                        {(() => {
                                            const adState = assignment?.assignmentDetails.find(ad => ad.assetCode === a.assetCode)?.state
                                            if (!adState || adState === STATE.WAITING_FOR_ACCEPTANCE) {
                                                return <CgCloseO className="asset-icon-remove" display={a.stat} onClick={() => handleRemove(a.assetCode)} />
                                            }
                                        })()}

                                    </div>
                                )}
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control
                                className='textarea-input'
                                name='note'
                                as='textarea'
                                maxLength={100}
                                defaultValue={assignment?.note}
                                value={note}
                                onChange={(e) => { setNote(e.target.value) }}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="float-end mb-3">
                        <Col>
                            {saveButton()}
                            <span
                                className="btn btn-outline-secondary"
                                style={{ marginLeft: "40px" }}
                                onClick={() => history.goBack()}>
                                Cancel
                            </span>
                        </Col>
                    </Form.Group>
                </Form>
            </Col>
            <ModalNotification
                title={"Cannot edit this assignment"}
                content={errorMessage}
                show={showModalError}
                setShow={setShowModalError}
            />
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

const STATE = {
    ACCEPTED: 'ACCEPTED',
    WAITING_FOR_ACCEPTANCE: 'WAITING_FOR_ACCEPTANCE',
    DECLINED: 'DECLINED',
    WAITING_FOR_RETURNING: 'WAITING_FOR_RETURNING',
    COMPLETED: 'COMPLETED'
};
const StateToLowerCase = {
    ACCEPTED: 'Accepted',
    WAITING_FOR_ACCEPTANCE: 'Waiting for acceptance',
    DECLINED: 'Declined',
    WAITING_FOR_RETURNING: 'Waiting for returning',
    COMPLETED: 'Completed'
};

export default EditAssignment;