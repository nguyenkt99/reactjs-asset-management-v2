import React from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'

export default function ModalFinishRepair({ note, setNote, description, show, handleClose, handleFinish }) {
    return (
        <>
            <Modal centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title">{description}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group as={Row} className='mb-3' controlId='note'>
                        <Form.Label column sm={1}>
                            Note
                        </Form.Label>
                        <Col>
                            <Form.Control className="textarea-input" name='note' as='textarea' required maxLength={100} value={note} onChange={(e) => setNote(e.target.value)} />
                        </Col>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleFinish}>
                        Finish
                    </Button>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
