import React, { useRef } from 'react'
import { Button } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';

export default function AssetExporter({ handlePrint }) {
    const componentRef = useRef()

    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    // })

    return (
        <>
            {/* <Button variant="danger" onClick={() => handlePrint()}>Export to PDF</Button> */}
            <div ref={componentRef}>
                <div className="report-header">
                    <span className="report-title">Asset Management</span>
                    <span className="report-time">{new Date()}</span>
                </div>
                <div className="report-body">
                    <div className="report-asset-item">
                        
                    </div>
                </div>
            </div>
        </>
    )
}
