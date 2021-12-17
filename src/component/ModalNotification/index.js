import React from 'react'
import { Modal } from 'react-bootstrap'
export default function ModalNotification({title, content, show, setShow}) {
    return (
        <div>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                centered
                id="detail-dialog"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#CF2338' }}>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {content}
                </Modal.Body>
            </Modal>
        </div>
    )
}
