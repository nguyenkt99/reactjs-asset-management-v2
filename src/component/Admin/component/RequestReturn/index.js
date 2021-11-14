import React, { useEffect, useState } from 'react'
import { Col, Row, Table, Modal, Toast, Dropdown, Button, Pagination, FormCheck, ToastContainer } from 'react-bootstrap'
import { HiFilter } from 'react-icons/hi'
import { del, get, put } from '../../../../httpHelper'
import './Request.css'
import { BsFillCaretDownFill, BsSearch } from "react-icons/bs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../ManageUser/CreateUser/CreateUser.css'
import { FaCalendarAlt } from "react-icons/fa"
import moment from "moment";

const elementPerPage = 10;
let requestId;

export default function Request() {

    const [requests, setRequests] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState('')
    const [keySearch, setKeySearch] = useState('')
    const [idASC, setIdASC] = useState(false)
    const [assetCodeASC, setAssetCodeASC] = useState(false)
    const [assetNameASC, setAssetNameASC] = useState(false)
    const [requestByASC, setRequestByASC] = useState(false)
    const [assignedDateASC, setAssignedDateASC] = useState(false)
    const [acceptByASC, setAcceptByASC] = useState(false)
    const [returnedDateASC, setReturnedDateASC] = useState(false)
    const [stateASC, setStateASC] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [data, setData] = useState([])
    const [stateChecked, setStateChecked] = useState([STATE.ALL])
    const [returnedDate, setReturnedDate] = useState()
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
    const [showModalCancelRequest, setShowModalCancelRequest] = useState(false);
    const [showModalAcceptRequest, setShowModalAcceptRequest] = useState(false);
    const [showToastError, setShowToastError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        get('/request').then(response => {
            if (response.status === 200) {
                setData(response.data)
                setRequests(response.data)
            } else {
                toastMessage('Something wrong!')
            }
        }).catch(error => toastMessage("Fail to connect server!"))
    }

    const handleCancelRequest = (requestId) => {
        del(`/request/${requestId}`)
            .then((response) => {
                if (response.status === 204) {
                    setRequests(requests.filter((r) => r.id !== requestId))
                    setData(data.filter((r) => r.id !== requestId))
                }
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 404) {
                        setErrorMessage('404 - Request ID not found!')
                    }
                } else {
                    setErrorMessage(`Error code: ${error.response.status}`)
                }
                setShowToastError(true);
            })
            .finally(() => setShowModalCancelRequest(false));
    }

    const handleAcceptRequest = (requestId) => {
        put(`/request/${requestId}`).then(response => {
            if (response.status === 200) {
                setData(data.map(e => {
                    if (e.id === requestId) {
                        e.state = response.data.state
                        e.acceptBy = response.data.acceptBy
                        e.returnedDate = response.data.returnedDate
                    }
                    return e
                }))
                setRequests(data.map(e => {
                    if (e.id === requestId) {
                        e.state = response.data.state
                        e.acceptBy = response.data.acceptBy
                        e.returnedDate = response.data.returnedDate
                    }
                    return e
                }))
            } else {
                toastMessage('Server not return successfully!')
            }
        }).catch((error) => {
            if (error.response) {
                if (error.response.status === 401) {
                    toastMessage(error.response.data.errorCode)
                }
            } else {
                toastMessage('Connection Error!')
            }
        }).finally(() => setShowModalAcceptRequest(false));
    }

    const toastMessage = (message) => {
        setMessage(message)
        setShowToast(true)
    }

    const handleSort = (key) => {
        let reverse = -1;
        let list = []
        if (key === SORT_BY.Id) {
            reverse = idASC ? -1 : 1;
            setIdASC(!idASC)
            list = requests.slice().sort((a, b) => (a.id > b.id) ? 1 * reverse : ((b.id > a.id) ? -1 * reverse : 0))
        } else if (key === SORT_BY.AssetCode) {
            reverse = assetCodeASC ? -1 : 1;
            setAssetCodeASC(!assetCodeASC)
            list = requests.slice().sort((a, b) => (a.assetCode > b.assetCode) ? 1 * reverse : ((b.assetCode > a.assetCode) ? -1 * reverse : 0))
        } else if (key === SORT_BY.AssetName) {
            reverse = assetNameASC ? -1 : 1;
            setAssetNameASC(!assetNameASC)
            list = requests.slice().sort((a, b) => (a.assetName > b.assetName) ? 1 * reverse : ((b.assetName > a.assetName) ? -1 * reverse : 0))
        } else if (key === SORT_BY.RequestBy) {
            reverse = requestByASC ? -1 : 1;
            setRequestByASC(!requestByASC)
            list = requests.slice().sort((a, b) => (a.requestBy > b.requestBy) ? 1 * reverse : ((b.requestBy > a.requestBy) ? -1 * reverse : 0))
        } else if (key === SORT_BY.AssignedDate) {
            reverse = assignedDateASC ? -1 : 1;
            setAssignedDateASC(!assignedDateASC)
            list = requests.slice().sort((a, b) => (a.assignedDate > b.assignedDate) ? 1 * reverse : ((b.assignedDate > a.assignedDate) ? -1 * reverse : 0))
        } else if (key === SORT_BY.AcceptByASC) {
            reverse = acceptByASC ? -1 : 1;
            setAcceptByASC(!acceptByASC)
            list = requests.slice().sort((a, b) => (a.acceptBy > b.acceptBy) ? 1 * reverse : ((b.acceptBy > a.acceptBy) ? -1 * reverse : 0))
        } else if (key === SORT_BY.ReturnedDate) {
            reverse = returnedDateASC ? -1 : 1;
            setReturnedDateASC(!returnedDateASC)
            list = requests.slice().sort((a, b) => (a.returnedDate > b.returnedDate) ? 1 * reverse : ((b.returnedDate > a.returnedDate) ? -1 * reverse : 0))
        } else if (key === SORT_BY.State) {
            reverse = stateASC ? -1 : 1;
            setStateASC(!stateASC)
            list = requests.slice().sort((a, b) => (a.state > b.state) ? 1 * reverse : ((b.state > a.state) ? -1 * reverse : 0))
        }
        setRequests(list)
    }

    const handleStateClick = (e) => {
        if (e === STATE.ALL) setStateChecked([e]);
        else {
            if (stateChecked.includes(e))
                setStateChecked([...stateChecked.filter((item) => item !== e)]);
            else
                setStateChecked([...stateChecked.filter((item) => item !== STATE.ALL), e]);
        }
        setCurrentPage(1);
    }

    const onClickCancelRequest = (id) => {
        requestId = id;
        setShowModalCancelRequest(true);
    }

    const onClickAcceptRequest = (id) => {
        requestId = id;
        setShowModalAcceptRequest(true);
    }

    useEffect(() => {
        let result = [...data];
        let date = returnedDate ? moment(new Date(returnedDate)).format("DD/MM/YYYY") : null

        result = filterSort(data.filter(u => (stateChecked.includes(u.state) || stateChecked.includes(STATE.ALL)) &&
            (u.returnedDate === date || date === null)), keySearch)

        setRequests(result);
        setCurrentPage(1);
    }, [stateChecked, returnedDate, keySearch]);


    const filterSort = (data, keySearch) => {
        return data.filter((e) => (
            e.id.toString() === keySearch ||
            e.assetCode.toLowerCase().includes(keySearch.toLowerCase()) ||
            e.assetName.toLowerCase().includes(keySearch.toLowerCase()) ||
            e.requestBy.toLowerCase().includes(keySearch.toLowerCase())
        ));
    };

    const openDatePicker = () => {
        setIsOpenDatePicker(!isOpenDatePicker);
    }

    return (
        <>
            <h3 className="content-title">Returning Request List</h3>
            <Row>
                <Col>
                    <Dropdown autoClose="outside" className="drop-filter">
                        <Button className="dropdown-button col-md-6 col-sm-12" disabled text={STATE.ALL}>
                            State
                        </Button>
                        <Dropdown.Toggle
                            className="dropdown-button-filter btn btn-primary"
                            id="dropdown-basic">
                            <HiFilter />
                        </Dropdown.Toggle>
                        <Dropdown.Menu id="drop-show-assignment">
                            <div className="checkbox px-3" onClick={() => {
                                handleStateClick(STATE.ALL)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.ALL]} checked={stateChecked.includes(STATE.ALL) ? 'checked' : ''} />
                            </div>
                            <div className="checkbox px-3" onClick={() => {
                                handleStateClick(STATE.COMPLETED)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.COMPLETED]} checked={stateChecked.includes(STATE.COMPLETED) ? 'checked' : ''} />
                            </div>
                            <div className="checkbox px-3" onClick={() => {
                                handleStateClick(STATE.WAITING_FOR_RETURNING)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.WAITING_FOR_RETURNING]} checked={stateChecked.includes(STATE.WAITING_FOR_RETURNING) ? 'checked' : ''} />
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col>
                    <div className="datepicker">
                        <DatePicker className="form-control date-picker-input"
                            dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                            onKeyDown={(e) => e.preventDefault()}
                            selected={returnedDate && new Date(returnedDate)}
                            onChange={(date) => setReturnedDate(moment(date).format('YYYY-MM-DD'))}
                            placeholderText="Returned Date"
                            onClickOutside={openDatePicker}
                            onSelect={openDatePicker}
                            onFocus={openDatePicker}
                            open={isOpenDatePicker}
                        />
                        <FaCalendarAlt className="icon-date" onClick={openDatePicker} />
                    </div>
                </Col>
                <Col>
                    <div className="float-end">
                        <div className="input-group">
                            <div className="form-outline">
                                <input
                                    value={keySearch}
                                    onChange={(e) => setKeySearch(e.target.value)}
                                    type="search"
                                    id="keySearch"
                                    className="form-control search-input"
                                    placeholder="Search" />
                            </div>
                            <button type="button" className="btn btn-primary" disabled={true}>
                                <BsSearch style={{}} />
                            </button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                <Table className="content-table" responsive>
                    <thead>
                        <tr>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.Id)} >
                                No.
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.AssetCode)} >
                                Asset Code
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.AssetName)} >
                                Asset Name
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.RequestBy)} >
                                Requested by
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.AssignedDate)} >
                                Assigned Date
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.AcceptedBy)} >
                                Accepted by
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.ReturnedDate)} >
                                Returned Date
                                <BsFillCaretDownFill/>
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.State)} >
                                State
                                <BsFillCaretDownFill/>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests && requests.slice((currentPage - 1) * elementPerPage, currentPage * elementPerPage)
                            .map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.assetCode}</td>
                                    <td>{r.assetName}</td>
                                    <td>{r.requestBy}</td>
                                    <td>{r.assignedDate}</td>
                                    <td>{r.acceptBy}</td>
                                    <td>{r.returnedDate}</td>
                                    <td>{STATEtoLowcase[r.state]}</td>
                                    <td>
                                        <div className="d-flex justify-content-evenly">
                                            {r.state === STATE.WAITING_FOR_RETURNING ?
                                                <>
                                                    <FontAwesomeIcon style={{ cursor: "pointer", marginRight: "8px" }} color="red" size="lg" icon={faCheck} onClick={() => onClickAcceptRequest(r.id)} />
                                                    <FontAwesomeIcon style={{ cursor: "pointer" }} size="lg" icon={faTimes} onClick={() => onClickCancelRequest(r.id)} />
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon style={{ marginRight: "8px" }} color="#ccc" size="lg" icon={faCheck} />
                                                    <FontAwesomeIcon color="#ccc" size="lg" icon={faTimes} />
                                                </>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Row>
            <Col className="float-end">
                <Pagination size="sm">
                    <Pagination.Prev disabled={currentPage < 2} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Pagination.Prev>
                    <Pagination.Item
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ display: currentPage < 2 && 'none' }}
                    >{currentPage - 1}</Pagination.Item>
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    <Pagination.Item
                        hidden={currentPage >= Math.ceil((requests.length / elementPerPage))}
                        disabled={currentPage === Math.ceil((requests.length / elementPerPage))}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >{currentPage + 1}</Pagination.Item>
                    <Pagination.Next
                        disabled={currentPage >= Math.ceil((requests.length / elementPerPage))}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >Next
                    </Pagination.Next>
                </Pagination>
            </Col>
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={1000} autohide position="top-end">
                <Toast.Header>
                    <strong className="me-auto">Notification!</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body>{message}</Toast.Body>
            </Toast>
            <ToastContainer className="p-3" id='t' position='middle-end'>
                <Toast bg="warning" onClose={() => setShowToastError(false)} show={showToastError} delay={3000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Notification!</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body>{errorMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
            <Modal centered show={showModalCancelRequest}>
                <Modal.Header>
                    <Modal.Title style={{ color: '#dc3545' }}>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to cancel this returning request?</Modal.Body>
                <Modal.Footer style={{ display: 'block', marginLeft: '32px' }}>
                    <Button variant='danger' onClick={() => handleCancelRequest(requestId)}>
                        Yes
                    </Button>
                    <Button variant='secondary' onClick={() => setShowModalCancelRequest(false)}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal centered show={showModalAcceptRequest}>
                <Modal.Header>
                    <Modal.Title style={{ color: '#dc3545' }}>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to mark this returning request as 'Completed'?</Modal.Body>
                <Modal.Footer style={{ display: 'block', marginLeft: '32px' }}>
                    <Button variant='danger' onClick={() => handleAcceptRequest(requestId)}>
                        Yes
                    </Button>
                    <Button variant='secondary' onClick={() => setShowModalAcceptRequest(false)}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const SORT_BY = { Id: 'id', AssetCode: 'assetCode', AssetName: 'assetName', RequestBy: 'requestBy', AssignedDate: 'assignedDate', AcceptBy: 'acceptBy', ReturnedDate: 'returnedDate', State: 'state' }
const STATE = { ALL: 'ALL', WAITING_FOR_RETURNING: 'WAITING_FOR_RETURNING', COMPLETED: 'COMPLETED' }
const STATEtoLowcase = { ALL: 'All', WAITING_FOR_RETURNING: 'Waiting for returning', COMPLETED: 'Completed' }