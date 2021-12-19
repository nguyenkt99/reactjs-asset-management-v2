import React, { useEffect, useState } from 'react'
import './RequestAssignUser.css'
import { Col, Row, Table, Modal, Toast, Button, ToastContainer, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { del, get } from '../../../httpHelper'
import { GrEditCus } from '../../icon/GrEditCus'
import { BsFillCaretDownFill } from "react-icons/bs";
import { HiInformationCircle } from "react-icons/hi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import "react-datepicker/dist/react-datepicker.css";
// import '../CreateUser/createuser.css'
import moment from "moment";
import { Link, useHistory } from 'react-router-dom';

const elementPerPage = 10;
let requestId;

export default function RequestAssignUser() {
    const [requestAssigns, setRequestAssigns] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState('')
    const [keySearch, setKeySearch] = useState('')
    const [idASC, setIdASC] = useState(false)
    const [noteASC, setNoteASC] = useState(false)
    const [categoryASC, setCategoryASC] = useState(false)
    const [requestedDateASC, setRequestedDateASC] = useState(false)
    const [requestedByASC, setRequestedBy] = useState(false)
    const [stateASC, setStateASC] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [dataRequestAssigns, setDataRequestAssigns] = useState([])
    const [stateChecked, setStateChecked] = useState([STATE.ALL])
    const [requestedDate, setRequestedDate] = useState()
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
    const [showModalDeleteRequest, setShowModalDeleteRequest] = useState(false);
    const [showToastError, setShowToastError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('')

    const history = useHistory();

    useEffect(() => {
        fetchRequestAssigns();
    }, []);

    const fetchRequestAssigns = () => {
        get('/request-assign').then(response => {
            if (response.status === 200) {
                let data = response.data
                if (history.location.state) {
                    data.unshift(data.splice(data.findIndex(item => item.id === history.location.state.id), 1)[0])
                }

                const dataWithStrCategories = data.map(r => {
                    let strCategories = '';
                    r.requestAssignDetails.forEach(rad => {
                        strCategories += `${rad.categoryName} (${rad.quantity}), `;
                    })
                    return { ...r, strCategories: strCategories.substring(0, strCategories.length - 2) }
                })

                setDataRequestAssigns(dataWithStrCategories)
                setRequestAssigns(dataWithStrCategories)
                history.replace(); // delete id in history to reload page...
            } else {
                toastMessage('Something wrong!')
            }
        }).catch(error => toastMessage("Fail to connect server!"))
    }

    const handleDeleteRequest = (requestId) => {
        del(`/request-assign/${requestId}`)
            .then((response) => {
                if (response.status === 204) {
                    setRequestAssigns(requestAssigns.filter((r) => r.id !== requestId))
                    setDataRequestAssigns(dataRequestAssigns.filter((r) => r.id !== requestId))
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
            .finally(() => setShowModalDeleteRequest(false));
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
            list = requestAssigns.slice().sort((a, b) => (a.id > b.id) ? 1 * reverse : ((b.id > a.id) ? -1 * reverse : 0))
        } else if (key === SORT_BY.Note) {
            reverse = noteASC ? -1 : 1;
            setNoteASC(!noteASC)
            list = requestAssigns.slice().sort((a, b) => (a.note > b.note) ? 1 * reverse : ((b.note > a.note) ? -1 * reverse : 0))
        } else if (key === SORT_BY.Category) {
            reverse = categoryASC ? -1 : 1;
            setCategoryASC(!categoryASC)
            list = requestAssigns.slice().sort((a, b) => (a.category > b.category) ? 1 * reverse : ((b.category > a.category) ? -1 * reverse : 0))
        } else if (key === SORT_BY.RequestedDate) {
            reverse = requestedDateASC ? -1 : 1;
            setRequestedDateASC(!requestedDateASC)
            list = requestAssigns.slice().sort((a, b) => (a.requestedDate > b.requestedDate) ? 1 * reverse : ((b.requestedDate > a.requestedDate) ? -1 * reverse : 0))
        } else if (key === SORT_BY.RequestedBy) {
            reverse = requestedByASC ? -1 : 1;
            setRequestedBy(!requestedByASC)
            list = requestAssigns.slice().sort((a, b) => (a.requestedBy > b.requestedBy) ? 1 * reverse : ((b.requestedBy > a.requestedBy) ? -1 * reverse : 0))
        } else if (key === SORT_BY.State) {
            reverse = stateASC ? -1 : 1;
            setStateASC(!stateASC)
            list = requestAssigns.slice().sort((a, b) => (a.state > b.state) ? 1 * reverse : ((b.state > a.state) ? -1 * reverse : 0))
        }
        setRequestAssigns(list)
    }

    const onClickDeleteRequest = (id) => {
        requestId = id;
        setShowModalDeleteRequest(true);
    }

    const filterSort = (dataRequestAssigns, keySearch) => {
        return dataRequestAssigns.filter((e) => (
            e.id.toString() === keySearch ||
            e.note.toLowerCase().includes(keySearch.toLowerCase()) ||
            e.requestedBy.toLowerCase().includes(keySearch.toLowerCase())
        ));
    };

    useEffect(() => {
        let result = [...dataRequestAssigns];
        let date = requestedDate ? moment(new Date(requestedDate)).format("DD/MM/YYYY") : null

        result = filterSort(dataRequestAssigns.filter(u => (stateChecked.includes(u.state) || stateChecked.includes(STATE.ALL)) &&
            (u.requestedDate === date || date === null)), keySearch)

        setRequestAssigns(result);
        setCurrentPage(1);
    }, [stateChecked, requestedDate, keySearch]);

    return (
        <>
            <h3 className="content-title">Request for Assigning List</h3>
            <Row>
                <Col>
                    <Link className="btn btn-danger float-end" to="/assigns/create">
                        Create request for assigning
                    </Link>
                </Col>
            </Row>
            <Row>
                <Table className="content-table" responsive>
                    <thead>
                        <tr>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.Id)} >
                                No.
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.Category)} >
                                Category
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.RequestedDate)} >
                                Requested Date
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.State)} >
                                State
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requestAssigns && requestAssigns.slice((currentPage - 1) * elementPerPage, currentPage * elementPerPage)
                            .map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td className="category-quantity-list">
                                        <span>{r.strCategories}</span>
                                        <OverlayTrigger
                                            key={r.id}
                                            placement="bottom"
                                            overlay={
                                                <Tooltip className="tooltip-text">
                                                    {r.note}
                                                </Tooltip>
                                            }
                                        >
                                            <span className="asset-name__icon"><HiInformationCircle /></span>
                                        </OverlayTrigger>
                                    </td>
                                    <td>{r.requestedDate}</td>
                                    <td>{STATEtoLowcase[r.state]}</td>
                                    <td>
                                        <div className="d-flex justify-content-evenly">
                                            {r.state === STATE.WAITING_FOR_ASSIGNING ?
                                                <>
                                                    <Link style={{ textDecoration: 'none', color: '#000' }} to={'/assigns/' + r.id}>
                                                        <GrEditCus />
                                                    </Link>
                                                    <FontAwesomeIcon style={{ cursor: "pointer" }} size="lg" icon={faTimes} onClick={() => onClickDeleteRequest(r.id)} />
                                                </>
                                                :
                                                <>
                                                    <Link style={{ textDecoration: 'none', color: '#ccc' }} to={'/assigns/edit/' + r.id}>
                                                        <GrEditCus />
                                                    </Link>
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
            <Modal centered show={showModalDeleteRequest}>
                <Modal.Header>
                    <Modal.Title style={{ color: '#dc3545' }}>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to delete this assigning request?</Modal.Body>
                <Modal.Footer>
                    <Button variant='danger' onClick={() => handleDeleteRequest(requestId)}>
                        Delete
                    </Button>
                    <Button variant='secondary' onClick={() => setShowModalDeleteRequest(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const SORT_BY = { Id: 'id', Note: 'note', Category: 'category', RequestedDate: 'requestedDate', RequestedBy: 'requestedBy', State: 'state' }
const STATE = { ALL: 'ALL', WAITING_FOR_ASSIGNING: 'WAITING_FOR_ASSIGNING', ACCEPTED: 'ACCEPTED', DECLINED: 'DECLINED' }
const STATEtoLowcase = { ALL: 'All', WAITING_FOR_ASSIGNING: 'Waiting for assigning', ACCEPTED: 'Accepted', DECLINED: 'Declined' }