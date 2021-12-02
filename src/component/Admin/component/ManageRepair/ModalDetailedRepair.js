import React from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'

export default function ModalDetailedRepair({ repair, show, handleClose }) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Detailed Repair Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        No
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.id} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Asset Code
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.assetCode} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Asset Name
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.assetName} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Category
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.categoryName} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className='mb-3' required>
                    <Form.Label column sm={3}>
                        Started Date
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.startedDate} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className='mb-3' required>
                    <Form.Label column sm={3}>
                        Finished Date
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.finishedDate} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="3">
                        Created By
                    </Form.Label>
                    <Col>
                        <Form.Control readOnly defaultValue={repair.assetName} />
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
                            defaultValue={repair.note}
                            readOnly
                        />
                    </Col>
                </Form.Group>
            </Modal.Body>
        </Modal>
    )
}
