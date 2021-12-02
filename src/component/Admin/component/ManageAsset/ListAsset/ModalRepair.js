import React, { useState } from 'react'
import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { FaCalendarAlt } from 'react-icons/fa';
import { post } from '../../../../../httpHelper';

export default function ModalRepair({ asset, show, handleClose, handleSubmit }) {
    const [note, setNote] = useState('')

    const handleSave = () => {
        const formData = {
            assetCode: asset.assetCode,
            note: note
        }

        handleSubmit(formData)
    }

    return <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create new repair</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Asset Code
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={asset.assetCode} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Asset Name
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={asset.assetName} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className='mb-3' required>
                    <Form.Label column sm={3}>
                        Assigned Date
                    </Form.Label>
                    <Col>
                        <div className="datepicker">
                            <DatePicker className="form-control"
                                disabled
                                dateFormat="dd/MM/yyyy"
                                selected={new Date()}
                            />
                            <FaCalendarAlt className="icon-date" />
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
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </Col>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer >
                <Button variant='danger' onClick={handleSave}>
                    Save
                </Button>
                <Button variant='secondary' onClick={handleClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}