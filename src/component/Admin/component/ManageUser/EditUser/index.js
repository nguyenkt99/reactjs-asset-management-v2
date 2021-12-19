import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Spinner, Modal } from 'react-bootstrap'
import { Link, useHistory, withRouter } from 'react-router-dom';
import { del, get, post, put } from '../../../../../httpHelper';
import './EditUser.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { FaAngleDown, FaCalendarAlt, FaCheck, FaEdit, FaTimes } from 'react-icons/fa'

let deptCode = '';
function EditUser(props) {
    let history = useHistory();
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [inputs, setInputs] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        deptCode: '',
        type: ''
    });
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [joinedDate, setJoinedDate] = useState('')
    const [isOpenDatePickerDob, setIsOpenDatePickerDob] = useState(false);
    const [isOpenDatePickerJd, setIsOpenDatePickerJd] = useState(false);
    const [validStateList, setValidStateList] = useState({
        isAgeValid: true,
        isJoinedDateValid: true,
        isJoinedAfterDOB: true
    });
    const [messageErrors, setMessageErrors] = useState({
        userUnder18: '',
        joinedAtTheWeekend: '',
        joindDateBeforeDOB: '',
        emailInvalid: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Department
    const [inputAddDeparment, setInputAddDeparment] = useState({
        deptCode: '',
        name: '',
    });
    const [selectedDept, setSelectedDept] = useState();
    const [display, setdisplay] = useState(false);
    const [show, setShow] = useState(false);
    const [showModalEditDepartment, setShowModalEditDepartment] = useState(false);
    const [errorMessageDepartmentEdit, setErrorMessageDepartmentEdit] = useState('');
    const [showModalDeleteDepartment, setShowModalDeleteDepartment] = useState(false);
    const [departmentEdit, setDepartmentEdit] = useState();
    const [showModalErrorDeleteDepartment, setShowModalErrorDeleteDepartment] = useState(false);
    const [errorAddDepartment, setErrorAddDepartment] = useState('');

    useEffect(() => {
        fetchUser();
        fetchRoles();
        fetchDepartments();
    }, [])

    const fetchRoles = () => {
        get('/role')
            .then((res) => {
                setRoles(res.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const fetchDepartments = () => {
        get('/department')
            .then((res) => {
                setDepartments(res.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const staffCode = props.match.params.staffCode;
    const fetchUser = () => {
        get(`/user/${staffCode}`)
            .then((res) => {
                let dOB = res.data.dateOfBirth.split("/").reverse().join("-")
                let joinedDate = res.data.joinedDate.split("/").reverse().join("-")
                // console.log(dOB + "  " + joinedDate);
                let object = {
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    email: res.data.email,
                    gender: res.data.gender,
                    deptCode: res.data.deptCode,
                    type: res.data.type
                }
                setInputs(object)
                setDateOfBirth(dOB)
                setJoinedDate(joinedDate)
                // console.log(res.data);
            })
            .catch((error) => {
                console.log(error)
                history.push({
                    pathname: '/users',
                });
            })
    }
    const handleOnChange = (e) => {
        setInputs(prevState => ({
            ...prevState, [e.target.name]: e.target.value
        }));
    }

    const handleValidation = () => {
        let isValid = true;
        const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regexEmail.test(inputs.email)) {
            setValidStateList(prevState => ({
                ...prevState, isEmail: false
            }));

            setMessageErrors(prevState => ({
                ...prevState, emailInvalid: 'This field must be email. Please input email'
            }));

            isValid = false;
        } else {
            setValidStateList(prevState => ({
                ...prevState, isEmail: true
            }));

            setMessageErrors(prevState => ({
                ...prevState, emailInvalid: ''
            }));
        }

        if (calcAge(joinedDate, dateOfBirth) < 18) {
            setValidStateList(prevState => ({
                ...prevState, isAgeValid: false
            }));

            setMessageErrors(prevState => ({
                ...prevState, userUnder18: 'User is under 18. Please select a different date'
            }));

            isValid = false;
        } else {
            setValidStateList(prevState => ({
                ...prevState, isAgeValid: true
            }));

            setMessageErrors(prevState => ({
                ...prevState, userUnder18: ''
            }));
        }

        if (isTheWeekend(joinedDate)) {
            setValidStateList(prevState => ({
                ...prevState, isJoinedDateValid: false
            }));

            setMessageErrors(prevState => ({
                ...prevState, joinedAtTheWeekend: 'Joined date is Saturday or Sunday. Please select a different date'
            }));

            isValid = false;
        } else {
            setValidStateList(prevState => ({
                ...prevState, isJoinedDateValid: true
            }));

            setMessageErrors(prevState => ({
                ...prevState, joinedAtTheWeekend: ''
            }));
        }

        if (new Date(joinedDate) < new Date(dateOfBirth)) {
            setValidStateList(prevState => ({
                ...prevState, isJoinedAfterDOB: false
            }));

            setMessageErrors(prevState => ({
                ...prevState, joindDateBeforeDOB: 'Joined date is not later than Date of Birth. Please select a different date'
            }));

            isValid = false;
        } else {
            setValidStateList(prevState => ({
                ...prevState, isJoinedAfterDOB: true
            }));

            setMessageErrors(prevState => ({
                ...prevState, joindDateBeforeDOB: ''
            }));
        }
        return isValid;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!handleValidation()) {
            return;
        }

        // yyyy-mm-dd -> dd/mm/yyyy
        const inputDates = {
            dateOfBirth: dateOfBirth.split("-").reverse().join("/"),
            joinedDate: joinedDate.split("-").reverse().join("/")
        }

        const formData = {
            ...inputs, ...inputDates
        }
        // console.log(formData);
        setIsSaving(true);
        put(`/user/${staffCode}`, formData)
            .then((res) => {
                console.log(res.data);
                history.push({
                    pathname: '/users',
                    state: {
                        staffCode: res.data.staffCode
                    }
                });
            })
            .catch((error) => {
                setIsSaving(false);
                if (error.response.status === 400) {
                    setValidStateList(prevState => ({
                        ...prevState, isEmail: false
                    }));

                    setMessageErrors(prevState => ({
                        ...prevState, emailInvalid: 'Email already exists!'
                    }));
                }
            });
    }

    const calcAge = (joinedDate, dateOfBirth) => {
        return Math.floor((new Date(joinedDate) - new Date(dateOfBirth)) / 3.15576e+10);
    }

    const isTheWeekend = (joinedDate) => {
        return (new Date(joinedDate).getDay() === 6 || new Date(joinedDate).getDay() === 0);
    }

    const saveButton = () => {
        if (isSaving)
            return <Button variant="danger" type="submit" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
        else if (Object.values(inputs).every(input => input !== ''))
            return <Button variant="danger" type="submit">Save</Button>
        return <Button variant="danger" type="submit" disabled>Save</Button>;
    }

    const openDatePickerDob = () => {
        setIsOpenDatePickerDob(!isOpenDatePickerDob);
    }

    const openDatePickerJd = () => {
        setIsOpenDatePickerJd(!isOpenDatePickerJd);
    }

    // Department
    const handleDisplayDepartments = () => {
        if (show !== true) {
            setShow(false);
            setdisplay(!display);
        } else {
        }
    };

    const onChangeSelected = (item) => {
        if (show !== true) {
            setdisplay(!display);
            setSelectedDept(item);
            // setCategory(item.name);

            setInputs((prevState) => ({
                ...prevState,
                deptCode: item.deptCode,
            }));
        } else {
        }
    };

    const handleOnClickAddDepartment = () => {
        setShow(true);
    };

    const handleClickEditDepartment = (category) => {
        setShowModalEditDepartment(true);
        setDepartmentEdit(category);
    }

    const handleCloseModalEditDapartment = () => {
        setShowModalEditDepartment(false);
        setErrorMessageDepartmentEdit('');
    }

    const handleEditDepartment = () => {
        departmentEdit.name = departmentEdit.name.replace(/\s+/g, ' ').trim();
        put(`/department/${departmentEdit.deptCode}`, departmentEdit)
            .then((res) => {
                fetchDepartments()
                handleCloseModalEditDapartment();
            })
            .catch((error) => {
                // console.log(error);
                if (error.response.status === 409) {
                    setErrorMessageDepartmentEdit('Department is already existed. Please enter a different department');
                }
            });
    }

    const handleCloseModalDeleteDepartment = () => {
        setShowModalDeleteDepartment(false);
    }

    const handleOnChangedepartmentEdit = (e) => {
        setDepartmentEdit((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value.replace(/[^A-Za-z\s]/gi, ''),
        }));
    }

    const handleDeleteDepartment = () => {
        del(`/department/${deptCode}`)
            .then((res) => {
                if (res.status === 200) {
                    setDepartments(departments.filter(d => d.deptCode !== deptCode))
                    setShowModalDeleteDepartment(false);
                }
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status === 409) {
                        setShowModalDeleteDepartment(false);
                        setShowModalErrorDeleteDepartment(true);
                    }
                }
            })
    }

    const handleClickDeleteDepartment = (departmentCode) => {
        deptCode = departmentCode;
        setShowModalDeleteDepartment(true);
    }

    const handleOnChangeAdd = (e) => {
        let value = e.target.value;

        if (e.target.name === 'deptCode') {
            value = value.replace(/[^0-9A-Za-z]/gi, '');
        } else {
            value = value.replace(/[^0-9A-Za-z\s]/gi, '');
            // value = value.replace(/\s+/g, ' ').trim();
        }
        // console.log('vl', value);
        setInputAddDeparment((prevState) => ({
            ...prevState,
            [e.target.name]: value,
        }));
    };

    const preAddCate = () => {
        let check = true;

        if (inputAddDeparment.name.replace(/\s/g, '') === '') {
            check = false;
        }
        if (inputAddDeparment.deptCode === '') {
            check = false;
        }

        if (inputAddDeparment.deptCode.length < 2 || inputAddDeparment.deptCode.length > 5) {
            check = false;
        }

        return check;
    };

    const addNewDepartment = () => {
        if (!preAddCate()) {
            return;
        }

        inputAddDeparment.deptCode = inputAddDeparment.deptCode.toUpperCase();
        inputAddDeparment.name = inputAddDeparment.name.replace(/\s+/g, ' ').trim();

        setErrorAddDepartment('');

        post('/department', inputAddDeparment)
            .then((res) => {
                setDepartments([
                    ...departments,
                    { name: res.data.name, deptCode: res.data.deptCode },
                ]);

                setShow(false);
                setInputAddDeparment({
                    deptCode: '',
                    name: '',
                });
            })
            .catch((error) => {
                if (error.response.status === 409) {
                    setErrorAddDepartment(
                        'Department is already exists. Please enter a different department'
                    );
                } else {
                    setErrorAddDepartment(
                        'Prefix is already exists. Please enter a different prefix'
                    );
                }
            });
    };

    const removeNewDepartment = () => {
        setInputAddDeparment({
            deptCode: '',
            name: '',
        });
        setErrorAddDepartment('');
        setShow(false);
    };

    return (
        <>
            <h5 className="content-title">Edit user</h5>
            <Row>
                <Col sm="6">
                    <Form onSubmit={handleSubmit} className="content-form">
                        <Form.Group as={Row} className="mb-4" controlId="firstName">
                            <Form.Label column sm={3}>
                                First Name
                            </Form.Label>
                            <Col>
                                <Form.Control name="firstName" type="text" required maxLength={50} value={inputs.firstName} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-4" controlId="lastName">
                            <Form.Label column sm={3}>
                                Last Name
                            </Form.Label>
                            <Col>
                                <Form.Control name="lastName" type="text" required maxLength={50} value={inputs.lastName} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-4" required controlId="dateOfBirth">
                            <Form.Label column sm={3}>
                                Date of Birth
                            </Form.Label>
                            <Col>
                                <div className="datepicker">
                                    <DatePicker className="form-control"
                                        dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                                        onKeyDown={(e) => e.preventDefault()}
                                        selected={dateOfBirth && new Date(dateOfBirth)}
                                        onChange={(date) => setDateOfBirth(moment(date).format('YYYY-MM-DD'))}
                                        onClickOutside={openDatePickerDob}
                                        onSelect={openDatePickerDob}
                                        onFocus={openDatePickerDob}
                                        open={isOpenDatePickerDob}
                                    />
                                    <FaCalendarAlt className="icon-date" onClick={openDatePickerDob} />
                                </div>
                                {!validStateList.isAgeValid &&
                                    < Form.Control.Feedback className="d-block" type="invalid">
                                        {messageErrors.userUnder18}
                                    </Form.Control.Feedback>
                                }
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-4" controlId="email">
                            <Form.Label column sm={3}>
                                Email
                            </Form.Label>
                            <Col>
                                <Form.Control name="email" type="text" required maxLength={50} value={inputs.email} onChange={handleOnChange} />
                                {!validStateList.isEmail &&
                                    < Form.Control.Feedback className="d-block" type="invalid">
                                        {messageErrors.emailInvalid}
                                    </Form.Control.Feedback>
                                }
                            </Col>
                        </Form.Group>
                        <fieldset>
                            <Form.Group as={Row} className="mb-4 align-items-center">
                                <Form.Label as="legend" column sm={3}>
                                    Gender
                                </Form.Label>
                                <Col xs={2}>
                                    <Form.Check
                                        type="radio" label="Female" name="gender" id="female" required value="Female" onChange={handleOnChange} checked={inputs.gender === "Female"}
                                    />
                                </Col>
                                <Col xs={2}>
                                    <Form.Check type="radio" label="Male" name="gender" id="male" required value="Male" onChange={handleOnChange} checked={inputs.gender === "Male"}
                                    />
                                </Col>
                            </Form.Group>
                        </fieldset>
                        <Form.Group as={Row} className="mb-4" controlId="joinedDate">
                            <Form.Label column sm={3}>
                                Joined Date
                            </Form.Label>
                            <Col>
                                <div className="datepicker">
                                    <DatePicker className="form-control"
                                        dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                                        onKeyDown={(e) => e.preventDefault()}
                                        selected={joinedDate && new Date(joinedDate)}
                                        onChange={(date) => setJoinedDate(moment(date).format('YYYY-MM-DD'))}
                                        onClickOutside={openDatePickerJd}
                                        onSelect={openDatePickerJd}
                                        onFocus={openDatePickerJd}
                                        open={isOpenDatePickerJd}
                                    />
                                    <FaCalendarAlt className="icon-date" onClick={openDatePickerJd} />
                                </div>
                                {(!validStateList.isJoinedDateValid &&
                                    < Form.Control.Feedback className="d-block" type="invalid">
                                        {messageErrors.joinedAtTheWeekend}
                                    </Form.Control.Feedback>)
                                    ||
                                    (!validStateList.isJoinedAfterDOB &&
                                        < Form.Control.Feedback className="d-block" type="invalid">
                                            {messageErrors.joindDateBeforeDOB}
                                        </Form.Control.Feedback>)
                                }
                            </Col>
                        </Form.Group>
                        {/* <Form.Group as={Row} className="mb-4">
                            <Form.Label column sm="3">Department</Form.Label>
                            <Col>
                                <Form.Select name="deptCode" type="text" required as="select" aria-label="Default select example" onChange={handleOnChange}>
                                    <option value="">Select department</option>
                                    {departments.map((department) =>
                                        <option key={department.id}
                                            value={department.deptCode}
                                            selected={department.deptCode === inputs.deptCode}
                                        >
                                            {department.name}
                                        </option>
                                    )}
                                </Form.Select>
                            </Col>
                        </Form.Group> */}

                        <Row className="align-items-center mb-3">
                            <Col sm={3}>
                                <div className='category_area'>
                                    <div className='label'>
                                        <span>Department</span>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <div className='category_input'>
                                    <div className='boder_search' onClick={handleDisplayDepartments}>
                                        {selectedDept ? selectedDept?.name : departments.find(d => d.deptCode === inputs?.deptCode)?.name}
                                        <FaAngleDown className='angledown' />
                                    </div>
                                    <div className='list_below' style={{ display: display ? 'block' : 'none' }}>
                                        <ul id='list'>
                                            {departments.map((item) => (
                                                <li className="category_item">
                                                    <span className="name_area" onClick={() => onChangeSelected(item)}>{item.name}</span>
                                                    <div className="icon_area">
                                                        <FaEdit className='times' onClick={() => handleClickEditDepartment(item)} />
                                                        <FaTimes className='times' onClick={() => handleClickDeleteDepartment(item.deptCode)} />
                                                    </div>
                                                </li>
                                            ))}

                                            {show === true ? (
                                                <li id='end_li'>
                                                    <div className='add_cate'>
                                                        <div className='left'>
                                                            <input
                                                                id='input_add'
                                                                value={inputAddDeparment.name}
                                                                maxLength={20}
                                                                minLength={1}
                                                                name='name'
                                                                onChange={handleOnChangeAdd}
                                                            />
                                                        </div>
                                                        <div className='right'>
                                                            <input
                                                                style={{ width: "68px" }}
                                                                id='input_add'
                                                                value={inputAddDeparment.deptCode}
                                                                maxLength={6}
                                                                minLength={2}
                                                                name='deptCode'
                                                                onChange={handleOnChangeAdd}
                                                            />
                                                        </div>
                                                        <div className='right'>
                                                            <FaCheck
                                                                className='check'
                                                                onClick={addNewDepartment}
                                                            />
                                                            <FaTimes
                                                                className='times'
                                                                onClick={removeNewDepartment}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span id='error'>
                                                        {errorAddDepartment}
                                                    </span>
                                                </li>
                                            ) : (
                                                <></>
                                            )}
                                            {show === false ? (
                                                <li id='end_li'>
                                                    <div className='add_cate'>
                                                        {show === false ? (
                                                            <Button
                                                                id='link'
                                                                variant='link'
                                                                onClick={handleOnClickAddDepartment}
                                                            >
                                                                Add new department
                                                            </Button>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </div>
                                                </li>
                                            ) : (
                                                <></>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Form.Group as={Row} className="mb-4">
                            <Form.Label column sm={3}>Type</Form.Label>
                            <Col>
                                <Form.Select className="select" name="type" type="text" required as="select" aria-label="Default select example" onChange={handleOnChange} >
                                    {roles.map((role) =>
                                        <option key={role.id}
                                            value={role.name}
                                            selected={role.name === inputs.type}
                                        >
                                            {ROLEtoLowcase[role.name]}
                                        </option>
                                    )}
                                </Form.Select>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="float-end mb-4">
                            <Col>
                                {saveButton()}
                                <Link className="btn btn-outline-secondary" style={{ marginLeft: "40px" }} to="/users">Cancel</Link>
                            </Col>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>

            <Modal size="sm" centered show={showModalEditDepartment} onHide={handleCloseModalEditDapartment}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit department</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={departmentEdit?.name} onChange={handleOnChangedepartmentEdit} />
                            {errorMessageDepartmentEdit &&
                                < Form.Control.Feedback className="d-block" type="invalid">
                                    {errorMessageDepartmentEdit}
                                </Form.Control.Feedback>
                            }
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>Department code</Form.Label>
                            <Form.Control type="text" name="prefix" readOnly value={departmentEdit?.deptCode} onChange={handleOnChangedepartmentEdit} />
                        </Form.Group>
                        <Form.Group className="float-end">
                            <Button variant="danger" onClick={handleEditDepartment}>
                                Save
                            </Button>
                            <Button variant="outline-secondary" onClick={handleCloseModalEditDapartment}>
                                Cancel
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal size="sm" centered show={showModalDeleteDepartment} onHide={handleCloseModalDeleteDepartment}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to delete this department?</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDeleteDepartment}>
                        Delete
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCloseModalDeleteDepartment}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModalErrorDeleteDepartment} onHide={() => setShowModalErrorDeleteDepartment(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Can not delete this department</Modal.Title>
                </Modal.Header>
                <Modal.Body>This department already has user!</Modal.Body>
            </Modal>
        </>
    )
}
export default withRouter(EditUser);
const ROLEtoLowcase = { ALL: 'All', ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff' }
