import React, { useEffect, useState } from 'react'
import {
    Col, Row, Table, Modal, Toast, Form, Dropdown, Button, Pagination,
    FormCheck, ToastContainer, Spinner, OverlayTrigger, Tooltip
} from 'react-bootstrap'
import { HiFilter } from 'react-icons/hi'
import { get, post, put } from '../../../../httpHelper'
import './Request.css'

import { CgCloseO } from 'react-icons/cg'
import { HiInformationCircle } from 'react-icons/hi'
import { BsFillCaretDownFill, BsSearch } from "react-icons/bs"
import { FaSearch, FaAngleDown, FaCalendarAlt } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import '../ManageUser/CreateUser/CreateUser.css'
import moment from "moment"

const elementPerPage = 10
let requestId

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
    const [stateChecked, setStateChecked] = useState([STATE.WAITING_FOR_ASSIGNING])
    const [requestedDate, setRequestedDate] = useState()
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)
    const [showModalDeclineRequest, setShowModalDeclineRequest] = useState(false)
    const [showModalCreateAssignment, setShowModalCreateAssignment] = useState(false)
    const [requestAssignInfo, setRequestAssignInfo] = useState()
    const [note, setNote] = useState('')
    const [showToastError, setShowToastError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [assignedDate, setAssignedDate] = useState()
    const [returnedDate, setReturnedDate] = useState()
    const [isOpenDatePickerAd, setIsOpenDatePickerAd] = useState(false)
    const [isOpenDatePickerRd, setIsOpenDatePickerRd] = useState(false)

    const [assets, setAssets] = useState([])
    const [assetsData, setAssetsData] = useState([])
    const [assetCodeASC, setAssetCodeASC] = useState(true)
    const [assetNameASC, setAssetNameASC] = useState(false)
    const [assetDisplay, setAssetDisplay] = useState(false)
    // const [asset, setAsset] = useState({ assetName: '' })
    const [selectingAssets, setSelectingAssets] = useState([])
    const [selectedAssets, setSelectedAssets] = useState([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchRequestAssigns()
    }, [])

    useEffect(() => {
        fetchAssets()
    }, [assignedDate, returnedDate])

    useEffect(() => {
        let result = [...data];
        let date = requestedDate ? moment(new Date(requestedDate)).format("DD/MM/YYYY") : null

        result = filterSort(data.filter(u => (stateChecked.includes(u.state) || stateChecked.includes(STATE.ALL)) &&
            (u.requestedDate === date || date === null)), keySearch)

        setRequestAssigns(result);
        setCurrentPage(1);
    }, [stateChecked, requestedDate, keySearch]);

    const fetchRequestAssigns = () => {
        get('/request-assign').then(response => {
            if (response.status === 200) {
                const dataWithStrCategories = response.data.map(r => {
                    let strCategories = '';
                    r.requestAssignDetails.forEach(rad => {
                        strCategories += `${rad.categoryName} (${rad.quantity}), `;
                    })
                    return { ...r, strCategories: strCategories }
                })
                setData(dataWithStrCategories)
                setRequestAssigns(dataWithStrCategories.filter(r => stateChecked.includes(r.state)))
            } else {
                toastMessage('Something wrong!')
            }
        }).catch(error => toastMessage("Fail to connect server!"))
    }

    const fetchAssets = () => {
        get(`/asset/available?startDate=${assignedDate}&endDate=${returnedDate}`).then(response => {
            if (response.status === 200) {
                setAssets(response.data)
                setAssetsData(response.data)
            } else {
                alert('Something wrong!')
            }
        }).catch(error => console.log(error.response))
    }

    const handleDeclineRequest = (id) => {
        put(`/request-assign/${id}/decline`, note)
            .then((response) => {
                if (response.status === 200) {
                    let newData = [...data]
                    const indexInData = data.findIndex(r => r.id === id)
                    newData[indexInData].state = 'DECLINED'
                    setData(newData)

                    let newRequestAssigns = [...requestAssigns]
                    const indexInRequests = requestAssigns.findIndex(r => r.id === id)
                    newData[indexInRequests].state = 'DECLINED'
                    setRequestAssigns(newRequestAssigns)
                    setShowModalDeclineRequest(false)
                }
            })
            .catch((error) => {
                // setErrorMessage(`Error code: ${error.response.status} ${error.response.message}`)
                setShowToastError(true)
            })
    }

    const handleAcceptRequest = () => {
        const formData = {
            requestAssignId: requestAssignInfo.id,
            assignedTo: requestAssignInfo.requestedBy,
            note: note,
            assignedDate: assignedDate.split("-").reverse().join("/"),
            intendedReturnDate: returnedDate.split("-").reverse().join("/"),
            assignmentDetails: selectedAssets.map(a => ({ assetCode: a.assetCode }))
        }

        setIsSaving(true)
        post('/assignment', formData)
            .then((res) => {
                const newData = data.map(item => {
                    if (item.id !== requestAssignInfo.id)
                        return item
                    return { ...item, state: "ACCEPTED" }
                })

                const newRequestAssigns = requestAssigns.map(item => {
                    if (item.id !== requestAssignInfo.id)
                        return item
                    return { ...item, state: "ACCEPTED" }
                })
                setData(newData);
                setRequestAssigns(newRequestAssigns);
                setShowModalCreateAssignment(false);
            })
            .catch((error) => {
                setIsSaving(false)
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

    const onClickAcceptRequest = (id) => {
        requestId = id
        let requestAssign = data.find(item => item.id === requestId)
        setRequestAssignInfo(requestAssign)
        setAssignedDate(requestAssign.intendedAssignDate.split('/').reverse().join('-'))
        setReturnedDate(requestAssign.intendedReturnDate.split('/').reverse().join('-'))
        setNote('')
        setShowModalCreateAssignment(true)
        // fetchAssets()
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
        console.log(requestId)
        // show modal input decline reason
        let requestAssign = data.find(item => item.id === requestId);
        let strCategories = '';
        requestAssign.requestAssignDetails.forEach(rad => {
            strCategories += `${rad.categoryName} (${rad.quantity}), `;
        })
        requestAssign = { ...requestAssign, strCategories: strCategories }
        setNote(requestAssign.note);
        setRequestAssignInfo(requestAssign);
        setShowModalDeclineRequest(true);
    }

    const openDatePicker = () => {
        setIsOpenDatePicker(!isOpenDatePicker);
    }

    const openDatePickerAd = () => {
        setIsOpenDatePickerAd(!isOpenDatePickerAd);
    }

    const openDatePickerRd = () => {
        setIsOpenDatePickerRd(!isOpenDatePickerRd);
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

    // const assetChange = (e) => {
    //     let assetCode = e.target.value;
    //     let a = assets.filter((a) => {
    //         return a.assetCode === assetCode;
    //     })
    //     document.getElementById(assetCode).checked = true;
    //     setAssetCurrent(a[0]);
    // }

    const assetChange = (e) => {
        const assetCode = e.target.value;
        const asset = assets.find(a => a.assetCode === assetCode)
        if (selectingAssets.find(a => a.assetCode === assetCode)) {
            setSelectingAssets([...selectingAssets.filter(a => a.assetCode !== assetCode)])
        } else {
            setSelectingAssets([...selectingAssets, asset])
        }
    }

    // const handleSelectAsset = () => {
    //     if (assetCurrent !== null) {
    //         setSelectedAssets(assetCurrent);
    //         setAssetDisplay(false);
    //     }
    // }

    const handleOk = () => {
        if (selectingAssets) setSelectedAssets(selectingAssets)
        setAssetDisplay(false)
    }

    const handleCancel = () => {
        // setAssetDisplay(false);
        // setAssetCurrent(null);
        // setSelectedAssets(null);
        // //asset
        // if (selectedAssets) {
        //     if (document.getElementById(selectedAssets.assetCode) !== null)
        //         document.getElementById(selectedAssets.assetCode).checked = true;
        // }

        selectedAssets.forEach((a) => {
            document.getElementById(a.assetCode).checked = true;
        })

        selectingAssets.forEach((a) => {
            if (document.getElementById(a.assetCode))
                document.getElementById(a.assetCode).checked = false;
        })

        setAssetDisplay(false)
        setSelectingAssets([])
    }

    const handleCancelCreateAssignment = () => {
        setShowModalCreateAssignment(false);
        handleCancel();
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

    // const saveButton = () => {
    //     if (isSaving)
    //         return <Button variant="danger" type="submit" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
    //     else if (selectedAssets && requestAssignInfo && assignedDate)
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
                        <Dropdown.Menu id="dropdown-menu">
                            <div className="dropdown-item checkbox px-3" onClick={() => {
                                handleStateClick(STATE.ALL)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.ALL]} checked={stateChecked.includes(STATE.ALL) ? 'checked' : ''} />
                            </div>
                            <div className="dropdown-item checkbox px-3" onClick={() => {
                                handleStateClick(STATE.WAITING_FOR_ASSIGNING)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.WAITING_FOR_ASSIGNING]} checked={stateChecked.includes(STATE.WAITING_FOR_ASSIGNING) ? 'checked' : ''} />
                            </div>
                            <div className="dropdown-item checkbox px-3" onClick={() => {
                                handleStateClick(STATE.ACCEPTED)
                            }}>
                                <FormCheck label={STATEtoLowcase[STATE.ACCEPTED]} checked={stateChecked.includes(STATE.ACCEPTED) ? 'checked' : ''} />
                            </div>
                            <div className="dropdown-item checkbox px-3" onClick={() => {
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

            {/* Modal decline */}
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
                                    defaultValue={requestAssignInfo && requestAssignInfo.strCategories}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId='note'>
                            <Form.Label column sm='4' className='pr-0'>
                                Note
                            </Form.Label>
                            <Col sm='8'>
                                <Form.Control
                                    className="textarea-input"
                                    as="textarea"
                                    // value={note}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group as={Row} className="float-end">
                        <Col>
                            <Button variant='danger' onClick={() => handleDeclineRequest(requestId)}>
                                Decline
                            </Button>
                            <Button variant='secondary' style={{ marginLeft: "20px" }} onClick={() => setShowModalDeclineRequest(false)}>
                                Cancel
                            </Button>
                        </Col>
                    </Form.Group>

                </Modal.Footer>
            </Modal>

            {/* Modal create assignment */}
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
                        as={Row}
                        className='mb-3'
                        required
                        controlId='installedDate'>
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
                                                        <th></th>
                                                        <th style={{ width: "100px" }} onClick={() => handleSortAsset(ASSET_SORT_BY.AssetCode)}>
                                                            Asset Code
                                                            <FaAngleDown />
                                                        </th>
                                                        <th style={{ width: "170px" }} onClick={() => handleSortAsset(ASSET_SORT_BY.AssetName)}>
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
                                                    {assetsData.map((a) => {
                                                        return <tr key={a.assetCode} className="fix_width">
                                                            <td style={{ width: "20px" }} >
                                                                <input
                                                                    id={a.assetCode}
                                                                    type="checkbox"
                                                                    name="assetCheckbox"
                                                                    value={a.assetCode}
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={assetChange}
                                                                // className="radio_custom"
                                                                ></input>
                                                            </td>
                                                            <td style={{ width: "92px" }} >{a.assetCode}</td>
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
                            {isSaving ?
                                <Button variant="danger" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
                                :
                                (selectedAssets && requestAssignInfo && assignedDate) ?
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