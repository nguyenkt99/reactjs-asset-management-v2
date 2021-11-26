import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Form, Button, Spinner, Modal } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { get, put } from '../../../httpHelper'
import { CgCloseO } from 'react-icons/cg'
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import moment from "moment"

export default function EditRequestAssign(props) {
    let history = useHistory()
    const [requestAssign, setRequestAssign] = useState()
    const [categories, setCategories] = useState([])
    const [dataCategories, setDataCategories] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [categoryId, setCategoryId] = useState('')
    const [quantity, setQuantity] = useState('')
    const [requestAssignDetails, setRequestAssignDetails] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [note, setNote] = useState('')
    const [assignedDate, setAssignedDate] = useState('')
    const [returnedDate, setReturnedDate] = useState('')
    const [isOpenDatePickerAd, setIsOpenDatePickerAd] = useState(false)
    const [isOpenDatePickerRd, setIsOpenDatePickerRd] = useState(false)

    const { requestId } = useParams()

    useEffect(() => {
        fetchCategories()
        fetchRequestAssign()
    }, [])


    const isMounted = useRef(true)
    useEffect(() => {
        if (isMounted.current) {
            isMounted.current = false
        } else {
            const newCategories = []
                categories.forEach(c => {
                    if(!requestAssign.requestAssignDetails.find(r => r.categoryId === c.prefix)) {
                        newCategories.push(c)
                    }                    
                })
            setCategories(newCategories)
        }
    }, [requestAssign])

    const fetchCategories = () => {
        get('/category')
            .then((res) => {
                setCategories(res.data)
                setDataCategories(res.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    // const id = props.match.params.requestId
    const fetchRequestAssign = () => {
        get(`/request-assign/${requestId}`)
            .then((res) => {
                if (res.data.state !== 'WAITING_FOR_ASSIGNING') {
                    history.push('/request-assign')
                }
                setRequestAssign(res.data)
                setNote(res.data.note)
                setRequestAssignDetails(res.data.requestAssignDetails)
                setAssignedDate(res.data.intendedAssignDate.split("/").reverse().join("-"))
                setReturnedDate(res.data.intendedReturnDate.split("/").reverse().join("-"))
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = {
            intendedAssignDate: assignedDate.split("-").reverse().join("/"),
            intendedReturnDate: returnedDate.split("-").reverse().join("/"),
            requestAssignDetails: requestAssignDetails.map(r => ({ categoryId: r.categoryId, quantity: r.quantity })),
            note: note,
        }

        setIsSaving(true)
        put(`/request-assign/${requestAssign.id}`, formData)
            .then((res) => {
                history.push({
                    pathname: '/request-assign',
                    state: {
                        id: res.data.id
                    }
                })
            })
            .catch((error) => {
                setIsSaving(false)
                console.log(error)
            })
    }

    const handleShowModal = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const handleAdd = () => {
        let categoryName = categories.find(c => c.prefix === categoryId).name;
        setRequestAssignDetails(prevState => (
            [...prevState, { categoryId: categoryId, quantity: quantity, categoryName: categoryName }]
        ))

        setCategories([...categories.filter(c => c.prefix !== categoryId)])
        setCategoryId('')
        setQuantity('')
        setShowModal(false)
    }

    const handleOnChangeQuantity = (e, prefix) => {
        let newRequestAssignDetails = [...requestAssignDetails]
        const quantity = e.target.value
        const index = requestAssignDetails.findIndex(r => r.categoryId === prefix)
        newRequestAssignDetails[index].quantity = e.target.value
        setRequestAssignDetails(newRequestAssignDetails)
    }

    const handleRemove = (categoryId) => {
        setRequestAssignDetails([...requestAssignDetails.filter(r => r.categoryId !== categoryId)])
        setCategories([...categories, dataCategories.find(c => c.prefix === categoryId)])
    }

    const openDatePickerAd = () => {
        setIsOpenDatePickerAd(!isOpenDatePickerAd)
    }

    const openDatePickerRd = () => {
        setIsOpenDatePickerRd(!isOpenDatePickerRd)
    }

    return (
        <>
            <h3 className="content-title">Create request for assigning</h3>
            <Col xs={6}>
                <Form className="content-form" onSubmit={handleSubmit}>
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
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Request List
                        </Form.Label>
                        <Col >
                            <div className='request-assign-list'>
                                {requestAssignDetails.map((r, index) => {
                                    return (
                                        <Form.Group key={index} as={Row} className='mb-3'>
                                            <Form.Label column sm={5}>
                                                {r.categoryName}
                                            </Form.Label>
                                            <Col sm={5}>
                                                <Form.Control type='number' name='quantity' value={r.quantity} onChange={(e) => handleOnChangeQuantity(e, r.categoryId)} />
                                            </Col>
                                            <Col>
                                                <CgCloseO className="icon-remove" onClick={() => handleRemove(r.categoryId)} />
                                            </Col>
                                        </Form.Group>
                                    )
                                })}
                                <Form.Group as={Row} className="mb-4">
                                    <Button className="btn-add" variant="outline-secondary" onClick={handleShowModal}>
                                        <FaPlus className="btn-add-icon" />
                                    </Button>
                                </Form.Group>
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control
                                className='text-area-input'
                                name='note'
                                as='textarea'
                                maxLength={100}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-4 float-end">
                        <Col >
                            <Button variant="danger" type="submit" disabled={requestAssignDetails.length === 0}>Save</Button>
                            <Link className="btn btn-outline-secondary" disabled style={{ marginLeft: "40px" }} to="/request-assign">Cancel</Link>
                        </Col>
                    </Form.Group>
                </Form>
            </Col>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Request for assigning detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group as={Row} className="mb-3" controlId="id">
                        <Form.Label column sm={3}>Category</Form.Label>
                        <Col>
                            <Form.Select className="form-select" name="category" type="text" required as="select" aria-label="Default select example" onChange={(e) => setCategoryId(e.target.value)}>
                                <option value="">Select category</option>
                                {categories.map((category, index) =>
                                    <option key={index} value={category.prefix} >
                                        {category.name}
                                    </option>
                                )}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={3}>
                            Quantity
                        </Form.Label>
                        <Col>
                            <Form.Control name='quantity' type='number' required onChange={(e) => setQuantity(e.target.value)} />
                        </Col>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" disabled={categoryId.length === 0 || quantity.length === 0} onClick={handleAdd}>
                        OK
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const ROLEtoLowcase = { ALL: 'All', ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff' }