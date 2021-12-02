import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function ModalConfirmDelete({ title, show, handleClose, handleDelete }) {
    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title">Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {title}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
