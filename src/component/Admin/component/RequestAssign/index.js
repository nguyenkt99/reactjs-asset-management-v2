import React, { useEffect, useState } from 'react'
import { Col, Row, Table, Modal, Toast, Form, Dropdown, Button, Pagination, FormCheck, ToastContainer, Spinner } from 'react-bootstrap'
import { HiFilter } from 'react-icons/hi'
import { del, get, post, put } from '../../../../httpHelper'
import './Request.css'
import { BsFillCaretDownFill, BsSearch } from "react-icons/bs";
import { FaSearch, FaAngleDown, FaCalendarAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../ManageUser/CreateUser/CreateUser.css'
import moment from "moment";

const elementPerPage = 10;
let requestId;

export default function RequestForAssigning() {

    const [requestAssigns, setRequestAssigns] = useState([])
    const [data, setData] = useState([])
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
    const [stateChecked, setStateChecked] = useState([STATE.ALL])
    const [requestedDate, setRequestedDate] = useState()
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)
    const [showModalDeclineRequest, setShowModalDeclineRequest] = useState(false)
    const [showModalCreateAssignment, setShowModalCreateAssignment] = useState(false)
    const [requestAssignInfo, setRequestAssignInfo] = useState()
    const [note, setNote] = useState('')
    const [showToastError, setShowToastError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [assignedDate, setAssignedDate] = useState(moment(new Date()).format('YYYY-MM-DD'))
    const [isOpenDatePickerAssigned, setIsOpenDatePickerAssigned] = useState(false)

    const [assets, setAssets] = useState([]);
    const [assetsData, setAssetsData] = useState([])
    const [assetCodeASC, setAssetCodeASC] = useState(true);
    const [assetNameASC, setAssetNameASC] = useState(false);
    const [assetDisplay, setAssetDisplay] = useState(false)
    // const [asset, setAsset] = useState({ assetName: '' })
    const [assetSelected, setAssetSelected] = useState()
    const [assetCurrent, setAssetCurrent] = useState(null)
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRequestAssigns();
        fetchAssets();
    }, []);

    const fetchRequestAssigns = () => {
        get('/request-assign').then(response => {
            if (response.status === 200) {
                setData(response.data)
                setRequestAssigns(response.data)
            } else {
                toastMessage('Something wrong!')
            }
        }).catch(error => toastMessage("Fail to connect server!"))
    }

    const fetchAssets = () => {
        get('/asset').then(response => {
            if (response.status === 200) {
                setAssets(response.data.filter((item) => {
                    return (item.state === "AVAILABLE" && item.categoryPrefix === requestAssignInfo.prefix);
                }))
                setAssetsData(response.data.filter((item) => {
                    return (item.state === "AVAILABLE" && item.categoryPrefix === requestAssignInfo.prefix);
                }))
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const handleDeclineRequest = (id) => {
        let formData = {
            state: "DECLINED",
            note: note
        }
        put(`/request-assign/${id}`, formData)
            .then((response) => {
                if (response.status === 200) {
                    setData(data.map(item => item.id === id ? response.data : item));
                    setRequestAssigns(data.map(item => item.id === id ? response.data : item));
                    setShowModalDeclineRequest(false);
                }
            })
            .catch((error) => {
                setErrorMessage(`Error code: ${error.response.status} ${error.response.message}`)
                setShowToastError(true);
            })
    }

    // const handleAcceptRequest = (requestId) => {
    //     put(`/request/${requestId}`).then(response => {
    //         if (response.status === 200) {
    //             setData(data.map(e => {
    //                 if (e.id === requestId) {
    //                     e.state = response.data.state
    //                     e.acceptBy = response.data.acceptBy
    //                     e.returnedDate = response.data.returnedDate
    //                 }
    //                 return e
    //             }))
    //             setRequestAssigns(data.map(e => {
    //                 if (e.id === requestId) {
    //                     e.state = response.data.state
    //                     e.acceptBy = response.data.acceptBy
    //                     e.returnedDate = response.data.returnedDate
    //                 }
    //                 return e
    //             }))
    //         } else {
    //             toastMessage('Server not return successfully!')
    //         }
    //     }).catch((error) => {
    //         if (error.response) {
    //             if (error.response.status === 401) {
    //                 toastMessage(error.response.data.errorCode)
    //             }
    //         } else {
    //             toastMessage('Connection Error!')
    //         }
    //     })
    //     .finally(() => setShowModalCreateAssignment(false));
    // }

    const handleAcceptRequest = () => {
        const formData = {
            assetCode: assetSelected.assetCode,
            note: note,
            assignedTo: requestAssignInfo.requestedBy,
            assignedDate: assignedDate.split("-").reverse().join("/")
        }
        console.log(formData);
        setIsSaving(true);
        post('/assignment', formData)
            .then((res) => {
                setShowModalCreateAssignment(false);
                put(`/request-assign/${requestAssignInfo.id}`, { state: "ACCEPTED" })
                    .then((resAccepted) => {
                        setData(data.filter(item => item.id !== requestAssignInfo.id));
                        setRequestAssigns(requestAssigns.filter(item => item.id !== requestAssignInfo.id));
                    })
                    .catch((error) => {
                        setErrorMessage(`Error code: ${error.response.status} ${error.response.message}`)
                        setShowToastError(true);
                    })
            })
            .catch((error) => {
                setIsSaving(false);
                setErrorMessage(`Error code: ${error.response.status} ${error.response.message}`)
                setShowToastError(true);
            })
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

    const onClickDeclineRequest = (id) => {
        requestId = id;
        // show modal input decline reason
        let requestAssign = data.find(item => item.id === requestId);
        setNote(requestAssign.note);
        setRequestAssignInfo(requestAssign);
        setShowModalDeclineRequest(true);
    }

    const onClickAcceptRequest = (id) => {
        requestId = id;
        let requestAssign = data.find(item => item.id === requestId);
        setRequestAssignInfo(requestAssign);
        setNote('');
        setShowModalCreateAssignment(true);
        // fetchAssets();
    }

    const openDatePicker = () => {
        setIsOpenDatePicker(!isOpenDatePicker);
    }

    const openDatePickerAssigned = () => {
        setIsOpenDatePickerAssigned(!isOpenDatePickerAssigned);
    }

    const filterSort = (data, keySearch) => {
        return data.filter((e) => (
            e.id.toString() === keySearch ||
            e.note.toLowerCase().includes(keySearch.toLowerCase()) ||
            e.requestedBy.toLowerCase().includes(keySearch.toLowerCase())
        ));
    };

    const handleAssetDisplay = () => {
        if (assetDisplay === false) {
            setAssetDisplay(true);
            fetchAssets();
        }
    }

    const handleSearchChangeAsset = (e) => {
        let keySearch = e.target.value;
        let newData = assetsData.filter(e => (
            e.assetCode.toLowerCase().includes(keySearch.toLowerCase())
            || e.assetName.toLowerCase().includes(keySearch.toLowerCase())
        ))
        setAssets(newData);
    }

    const assetChange = (e) => {
        let assetCode = e.target.value;
        let a = assets.filter((a) => {
            return a.assetCode === assetCode;
        })
        document.getElementById(assetCode).checked = true;
        setAssetCurrent(a[0]);
    }

    const handleSelectAsset = () => {
        if (assetCurrent !== null) {
            setAssetSelected(assetCurrent);
            setAssetDisplay(false);
        }
    }

    const handleCancelAssetSelected = () => {
        setAssetDisplay(false);
        setAssetCurrent(null);
        setAssetSelected(null);
        //asset
        if (assetSelected) {
            if (document.getElementById(assetSelected.assetCode) !== null)
                document.getElementById(assetSelected.assetCode).checked = true;
        }
    }

    const handleCancelCreateAssignment = () => {
        setShowModalCreateAssignment(false);
        handleCancelAssetSelected();
    }

    const handleSortAsset = (key) => {
        let reverse = -1;
        let list = [];
        if (key === ASSET_SORT_BY.AssetCode) {
            reverse = assetCodeASC ? -1 : 1;
            setAssetCodeASC(!assetCodeASC);
            list = assetsData
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
            list = assetsData
                .slice()
                .sort((a, b) =>
                    a.assetName > b.assetName
                        ? 1 * reverse
                        : b.assetName > a.assetName
                            ? -1 * reverse
                            : 0
                );
        }

        setAssetsData(list);
    };

    useEffect(() => {
        let result = [...data];
        let date = requestedDate ? moment(new Date(requestedDate)).format("DD/MM/YYYY") : null

        result = filterSort(data.filter(u => (stateChecked.includes(u.state) || stateChecked.includes(STATE.ALL)) &&
            (u.requestedDate === date || date === null)), keySearch)

        setRequestAssigns(result);
        setCurrentPage(1);
    }, [stateChecked, requestedDate, keySearch]);

    // const saveButton = () => {
    //     if (isSaving)
    //         return <Button variant="danger" type="submit" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
    //     else if (assetSelected && requestAssignInfo && assignedDate)
    //         return <Button variant="danger" type="submit">Save</Button>
    //     return <Button variant="danger" type="submit" disabled>Save</Button>;
    // }

    return (
        <>
            <h3 className="content-title">Request for Assigning List</h3>
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
                                handleStateClick(STATE.WAITING_FOR_ASSIGNING)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.WAITING_FOR_ASSIGNING]} checked={stateChecked.includes(STATE.WAITING_FOR_ASSIGNING) ? 'checked' : ''} />
                            </div>
                            {/* <div className="checkbox px-3" onClick={() => {
                                handleStateClick(STATE.ACCEPTED)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.ACCEPTED]} checked={stateChecked.includes(STATE.ACCEPTED) ? 'checked' : ''} />
                            </div> */}
                            <div className="checkbox px-3" onClick={() => {
                                handleStateClick(STATE.DECLINED)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.DECLINED]} checked={stateChecked.includes(STATE.DECLINED) ? 'checked' : ''} />
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col>
                    <div className="datepicker">
                        <DatePicker className="form-control date-picker-input"
                            dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                            onKeyDown={(e) => e.preventDefault()}
                            selected={requestedDate && new Date(requestedDate)}
                            onChange={(date) => setRequestedDate(moment(date).format('YYYY-MM-DD'))}
                            placeholderText="Requested Date"
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
                            <th className="table-thead w-7" onClick={() => handleSort(SORT_BY.Id)} >
                                No.
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-28" onClick={() => handleSort(SORT_BY.Note)} >
                                Note
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-14" onClick={() => handleSort(SORT_BY.Category)} >
                                Category
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-14" onClick={() => handleSort(SORT_BY.RequestedDate)} >
                                Requested Date
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-14" onClick={() => handleSort(SORT_BY.RequestedBy)} >
                                Requested by
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-16" onClick={() => handleSort(SORT_BY.State)} >
                                State
                                <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead w-7"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requestAssigns && requestAssigns.slice((currentPage - 1) * elementPerPage, currentPage * elementPerPage)
                            .map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.note}</td>
                                    <td>{r.category}</td>
                                    <td>{r.requestedDate}</td>
                                    <td>{r.requestedBy}</td>
                                    <td>{STATEtoLowcase[r.state]}</td>
                                    <td>
                                        <div className="d-flex justify-content-evenly">
                                            {r.state === STATE.WAITING_FOR_ASSIGNING ?
                                                <>
                                                    <FontAwesomeIcon style={{ cursor: "pointer" }} color="red" size="lg" icon={faCheck} onClick={() => onClickAcceptRequest(r.id)} />
                                                    <FontAwesomeIcon style={{ cursor: "pointer" }} size="lg" icon={faTimes} onClick={() => onClickDeclineRequest(r.id)} />
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon color="#ccc" size="lg" icon={faCheck} />
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
                        hidden={currentPage >= Math.ceil((requestAssigns.length / elementPerPage))}
                        disabled={currentPage === Math.ceil((requestAssigns.length / elementPerPage))}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >{currentPage + 1}</Pagination.Item>
                    <Pagination.Next
                        disabled={currentPage >= Math.ceil((requestAssigns.length / elementPerPage))}
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
            <Modal centered show={showModalDeclineRequest}>
                <Modal.Header>
                    <Modal.Title style={{ color: '#dc3545' }}>Decline request for assigning?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='modal-detail-asset'>
                        <Form.Group as={Row} className="mb-2" controlId='category'>
                            <Form.Label column sm='4' className='pr-0'>
                                Category
                            </Form.Label>
                            <Col sm='8'>
                                <Form.Control readOnly
                                    defaultValue={requestAssignInfo && requestAssignInfo.category}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId='note'>
                            <Form.Label column sm='4' className='pr-0'>
                                Note
                            </Form.Label>
                            <Col sm='8'>
                                <Form.Control
                                    as="textarea"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block', marginLeft: '32px' }}>
                    <Button variant='danger' onClick={() => handleDeclineRequest(requestId)}>
                        Decline
                    </Button>
                    <Button variant='secondary' onClick={() => setShowModalDeclineRequest(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModalCreateAssignment}>
                <Modal.Header>
                    <Modal.Title style={{ color: '#dc3545' }}>Create assignment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* <Form onSubmit={handleSubmit}> */}
                    <Form.Group as={Row} className="mb-2" controlId='category'>
                        <Form.Label column sm={3}>
                            User
                        </Form.Label>
                        <Col>
                            <Form.Control readOnly
                                defaultValue={requestAssignInfo && requestAssignInfo.requestedBy}
                            />
                        </Col>
                    </Form.Group>
                    {/* {assetJsx} */}
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
                                    {assetSelected && assetSelected.assetName}
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
                                                    </tr>
                                                </thead>
                                                <tbody className="table-content fix_width">
                                                    {assets.map((a) => {
                                                        return <tr key={a.assetCode} className="fix_width">
                                                            <td style={{ width: "20px" }} >
                                                                <input
                                                                    id={a.assetCode}
                                                                    type="radio"
                                                                    // id = {u.staffCode} 
                                                                    name="asset_radio"
                                                                    value={a.assetCode}
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={assetChange}
                                                                    className="radio_custom"
                                                                ></input>
                                                            </td>
                                                            <td style={{ width: "115px" }} >{a.assetCode}</td>
                                                            <td style={{ width: "170px" }} >{a.assetName}</td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                                <Col className="button-group">
                                                    <Button variant='danger' style={{ padding: "0px 19px" }} onClick={handleSelectAsset} >
                                                        Save
                                                    </Button>
                                                    <Button variant="outline-secondary"
                                                        style={{ marginLeft: '20px' }}
                                                        onClick={handleCancelAssetSelected}
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
                    <Form.Group
                        as={Row}
                        className='mb-3'
                        required
                        controlId='installedDate'>
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
                                    onClickOutside={openDatePickerAssigned}
                                    onSelect={openDatePickerAssigned}
                                    onFocus={openDatePickerAssigned}
                                    open={isOpenDatePickerAssigned}
                                />
                                <FaCalendarAlt className="icon-date" onClick={openDatePickerAssigned} />
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-1' controlId='firstName'>
                        <Form.Label column sm={3}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control
                                as="textarea"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    {/* </Form> */}
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group as={Row} className="float-end">
                        <Col>
                            {/* <Button variant='danger' onClick={() => handleAcceptRequest(requestId)}>
                                Save
                            </Button> */}
                            {isSaving ?
                                <Button variant="danger" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
                                :
                                (assetSelected && requestAssignInfo && assignedDate) ?
                                    <Button variant="danger" onClick={() => handleAcceptRequest()}>Save</Button>
                                    :
                                    <Button variant="danger" disabled>Save</Button>
                            }
                            <Button variant='secondary' style={{ marginLeft: "20px" }} onClick={handleCancelCreateAssignment}>
                                Cancel
                            </Button>
                        </Col>
                    </Form.Group>
                </Modal.Footer>
            </Modal>
        </>
    )


}

const SORT_BY = { Id: 'id', Note: 'note', Category: 'category', RequestedDate: 'requestedDate', RequestedBy: 'requestedBy', State: 'state' }
const STATE = { ALL: 'ALL', WAITING_FOR_ASSIGNING: 'WAITING_FOR_ASSIGNING', ACCEPTED: 'ACCEPTED', DECLINED: 'DECLINED' }
const STATEtoLowcase = { ALL: 'All', WAITING_FOR_ASSIGNING: 'Waiting for assigning', ACCEPTED: 'Accepted', DECLINED: 'Declined' }

const ASSET_SORT_BY = {
    AssetCode: 'AssetCode',
    AssetName: 'AssetName'
};