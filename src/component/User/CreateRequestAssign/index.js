import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom';
import { get, post } from '../../../httpHelper'
import "react-datepicker/dist/react-datepicker.css";

export default function CreateRequestAssign() {
    let history = useHistory();
    const [categories, setCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [inputs, setInputs] = useState({
        prefix: '',
        note: ''
    });

    useEffect(() => {
        fetchCategories();
    }, [])

    const fetchCategories = () => {
        get('/category')
            .then((res) => {
                setCategories(res.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSaving(true);
        post('/request-assign', inputs)
            .then((res) => {
                history.push({
                    pathname: './request_assign',
                    state: {
                        id: res.data.id
                    }
                });

            })
            .catch((error) => {
                setIsSaving(false);
                console.log(error);
            });
    }

    const handleOnChange = (e) => {
        setInputs(prevState => ({
            ...prevState, [e.target.name]: e.target.value
        }));
    }

    const saveButton = () => {
        if (isSaving)
            return <Button variant="danger" type="submit" disabled><Spinner animation="border" size="sm" variant="light" />Save</Button>
        else if (Object.values(inputs).every(input => input !== ''))
            return <Button variant="danger" type="submit">Save</Button>
        return <Button variant="danger" type="submit" disabled>Save</Button>;
    }

    return (
        <div className="p-5">
            <h5 className="mb-4" style={{ color: "#CF2338" }}>Create request for assigning</h5>
            <Col xs={12} sm={12} md={7}>
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Row} className="mb-3" controlId="id">
                        <Form.Label column sm={3}>Category</Form.Label>
                        <Col>
                            <Form.Select name="prefix" type="text" required as="select" aria-label="Default select example" onChange={handleOnChange}>
                                <option value="">Select category</option>
                                {categories.map((category, index) =>
                                    <option key={index} value={category.prefix} >
                                        {category.name}
                                    </option>
                                )}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='note'>
                        <Form.Label column sm={3}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control name='note' as='textarea' required maxLength={100} onChange={handleOnChange}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" className="float-end">
                        <Col>
                            {saveButton()}
                            <Link className="btn btn-outline-secondary" disabled style={{ marginLeft: "40px" }} to="/request_assign">Cancel</Link>
                        </Col>
                    </Form.Group>
                </Form>
            </Col>
        </div>
    )
}

const ROLEtoLowcase = { ALL: 'All', ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff' }