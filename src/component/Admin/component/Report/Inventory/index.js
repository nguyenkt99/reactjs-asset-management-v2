import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { get } from '../../../../../httpHelper';
import './Inventory.css'
import moment from "moment";
import { jsPDF } from "jspdf"
import html2pdf from 'html2pdf.js'

export default function Inventory() {
    const componentRef = useRef()
    const [assets, setAssets] = useState([])

    const fetchAssets = () => {
        get('/asset')
            .then((response) => {
                setAssets(response.data)
            })
            .catch((error) => console.log('Cannot fetch assets!'))
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    // })

    // const generatePdf = () => {
    //     var doc = new jsPDF("p", "pt", "a4")
    //     doc.html(componentRef.current, {
    //         margin: [20, 20, 20, 20],
    //         callback: (pdf) => {
    //             pdf.save("downloadfile.pdf")
    //         }
    //     })
    // }

    const generatePdf = () => {
        let opt = {
            margin: 1,
            filename: 'my-invoice.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(componentRef.current).save()
        // html2pdf(componentRef.current)
    }

    return (
        <>
            <Button variant="danger" onClick={() => generatePdf()}>Export to PDF</Button>

            <div ref={componentRef} className="report">
                <div className="report-header">
                    <div className="report-title">ASSET MANAGEMENT</div>
                    <div className="report-time">{`(${moment(new Date()).format('lll')})`}</div>
                </div>
                <div className="report-body">
                    {assets.map(a => (
                        <div className="report-asset-item">
                            <Row>
                                <Col sm="4" style={{ fontStyle: "italic", textAlign: "center", marginBottom: "0" }}>
                                    <Form.Group as={Row}>
                                        <Form.Label style={{ fontStyle: "italic", textAlign: "center", marginBottom: "0" }}>
                                            {a.assetCode}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label style={{ fontWeight: "bold", textAlign: "center" }}>
                                            {a.assetName}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label>
                                            {a.categoryName}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label>
                                            {a.installedDate}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label>
                                            {a.state}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label>
                                            {a.location}
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Row}>
                                        <Form.Label>
                                            "{a.specification}"
                                        </Form.Label>
                                    </Form.Group>

                                </Col>

                                {/* History */}
                                <Col>
                                    {a?.assignmentDetails.length > 0 ?
                                        <>
                                            <span className="history-table-name">Assignment History</span>
                                            <Table responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Assigned Date</th>
                                                        <th>Assigned to</th>
                                                        <th>Assigned by</th>
                                                        <th>Returned Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {a?.assignmentDetails.map((ad, index) => (
                                                        <tr key={index}>
                                                            <td>{ad.assignedDate}</td>
                                                            <td>{ad.assignedTo}</td>
                                                            <td>{ad.assignedBy}</td>
                                                            <td>{ad.returnedDate ? ad.returnedDate : ""}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </>
                                        : <></>
                                    }

                                    {a?.repairs.length > 0 ?
                                        <>
                                            <span className="history-table-name">Repair History</span>
                                            <Table responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Stared Date</th>
                                                        <th>Note</th>
                                                        <th>Created by</th>
                                                        <th>Finished Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {a?.repairs.map((r, index) => (
                                                        <tr key={index}>
                                                            <td>{r.startedDate}</td>
                                                            <td>{r.note}</td>
                                                            <td>{r.createdBy}</td>
                                                            <td>{r.finishedDate ? r.returnedDate : ""}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </>
                                        :
                                        <></>
                                    }
                                </Col>
                            </Row>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
