import React, { useEffect, useState } from 'react'
import { Button, Col, Row, Table, FormGroup, Form } from 'react-bootstrap'
import { BsFillCaretDownFill } from 'react-icons/bs'
import { get } from '../../../../../httpHelper'
import moment from 'moment';
import DatePicker from "react-datepicker"
import { FaCalendarAlt } from "react-icons/fa"
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

export default function AssignedAssignments() {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const DATE = moment(new Date()).format('DD-MM-YYYY');

    const [report, setReport] = useState([]);
    // const [assignedDate, setAssignedDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
    const [assignedDate, setAssignedDate] = useState();
    const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)

    const [dataReport, setDataReport] = useState([]);
    const [categoryASC, setCategoryASC] = useState(false);
    const [totalASC, setTotalASC] = useState(false);
    const [assignedASC, setAssignedASC] = useState(false);
    const [availableASC, setAvailableASC] = useState(false);
    const [notAvailableASC, setNotAvailableASC] = useState(false);
    const [repairingASC, setRepairingASC] = useState(false);
    const [watingForRecycleASC, setWatingForRecycleASC] = useState(false);
    const [recycledASC, setRecycledASC] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [assignedDate])

    const fetchReport = () => {
        get(`/report/assignments-assigned/${assignedDate}`)
            .then((response) => {
                if (response.status === 200) {
                    setReport(response.data);
                    setDataReport(response.data);
                } else {
                    // toastMessage('Something wrong!');
                }
            })
            .catch((error) => {
                console.log(error);
                // toastMessage("Fail to connect server!");
            });
    }

    const formatData = (dataRaw) => {
        let dataFormatted = [];
        dataFormatted = dataRaw.map(d => (
            {
                "Category": d.category,
                "Total": d.total,
                "Assigned": d.assigned,
                "Available": d.available,
                "Not Avaliable": d.notAvailable,
                "Repairing": d.repairing,
                "Waiting For Recyling": d.waitingForRecycle,
                "Recycled": d.recycled
            }
        ));
        return dataFormatted;
    }

    const handleSort = (key) => {
        let reverse = -1;
        let list = [];
        if (key === SORT_BY.CATEGORY) {
            reverse = categoryASC ? -1 : 1;
            setCategoryASC(!categoryASC);
            list = report.slice().sort((a, b) => (a.category > b.category) ? 1 * reverse : ((b.category > a.category) ? -1 * reverse : 0))
        } else if (key === SORT_BY.TOTAL) {
            reverse = totalASC ? -1 : 1;
            setTotalASC(!totalASC)
            list = report.slice().sort((a, b) => (a.total > b.total) ? 1 * reverse : ((b.total > a.total) ? -1 * reverse : 0))
        } else if (key === SORT_BY.ASSIGNED) {
            reverse = assignedASC ? -1 : 1;
            setAssignedASC(!assignedASC)
            list = report.slice().sort((a, b) => (a.assigned > b.assigned) ? 1 * reverse : ((b.assigned > a.assigned) ? -1 * reverse : 0))
        } else if (key === SORT_BY.AVAILABLE) {
            reverse = availableASC ? -1 : 1;
            setAvailableASC(!availableASC)
            list = report.slice().sort((a, b) => (a.available > b.available) ? 1 * reverse : ((b.available > a.available) ? -1 * reverse : 0))
        } else if (key === SORT_BY.NOT_AVAILABLE) {
            reverse = notAvailableASC ? -1 : 1;
            setNotAvailableASC(!notAvailableASC)
            list = report.slice().sort((a, b) => (a.notAvailable > b.notAvailable) ? 1 * reverse : ((b.notAvailable > a.notAvailable) ? -1 * reverse : 0))
        } else if (key === SORT_BY.REPAIRING) {
            reverse = repairingASC ? -1 : 1;
            setRepairingASC(!repairingASC)
            list = report.slice().sort((a, b) => (a.repairing > b.repairing) ? 1 * reverse : ((b.repairing > a.repairing) ? -1 * reverse : 0))
        } else if (key === SORT_BY.WAITING_FOR_RECYCLING) {
            reverse = watingForRecycleASC ? -1 : 1;
            setWatingForRecycleASC(!watingForRecycleASC)
            list = report.slice().sort((a, b) => (a.waitingForRecycle > b.waitingForRecycle) ? 1 * reverse : ((b.waitingForRecycle > a.waitingForRecycle) ? -1 * reverse : 0))
        } else if (key === SORT_BY.RECYCLED) {
            reverse = recycledASC ? -1 : 1;
            setRecycledASC(!recycledASC)
            list = report.slice().sort((a, b) => (a.recycled > b.recycled) ? 1 * reverse : ((b.recycled > a.recycled) ? -1 * reverse : 0))
        }
        setReport(list);
    }

    const exportToCSV = (csvData, fileName) => {
        const dataFormatted = formatData(csvData);
        var wb = XLSX.utils.book_new();
        wb.SheetNames.push('report');
        var ws_data = [['ASSET MANAGEMENT REPORT', `Date: ${DATE}`], ['']];
        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.sheet_add_json(ws, dataFormatted, { skipHeader: false, origin: 'B4' });
        wb.Sheets['report'] = ws;
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }

    const openDatePicker = () => {
        setIsOpenDatePicker(!isOpenDatePicker);
    }

    return (
        <>
            <h3 className="content-title">Assigned Assignemts</h3>
            {/* <Row>
                <Col>
                    <Button className="float-end" variant="danger" onClick={() => exportToCSV(dataReport, `asset_management_${DATE}`)}>Export to .xlsx</Button>
                </Col>
            </Row> */}
            <Row>
                <Col sm="2">
                    <div className="datepicker">
                        <DatePicker className="form-control date-picker-input"
                            dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                            onKeyDown={(e) => e.preventDefault()}
                            selected={assignedDate && new Date(assignedDate)}
                            onChange={(date) => setAssignedDate(moment(date).format('YYYY-MM-DD'))}
                            placeholderText="Assigned Date"
                            onClickOutside={openDatePicker}
                            onSelect={openDatePicker}
                            onFocus={openDatePicker}
                            open={isOpenDatePicker}
                        />
                        <FaCalendarAlt className="icon-date" onClick={openDatePicker} />
                    </div>
                </Col>
            </Row>
            <Row>
                <Table className="content-table" responsive>
                    <thead>
                        <tr>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.CATEGORY)} >
                                Asset Code <BsFillCaretDownFill />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.TOTAL)}>
                                Asset Name <BsFillCaretDownFill cursor="pointer" />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.ASSIGNED)}>
                                Assigned By <BsFillCaretDownFill cursor="pointer" />
                            </th>
                            <th className="table-thead" onClick={() => handleSort(SORT_BY.AVAILABLE)}>
                                Assigned To <BsFillCaretDownFill cursor="pointer" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((r, index) => (
                            <tr key={index}>
                                <td>{r.assetCode}</td>
                                <td>{r.assetName}</td>
                                <td>{r.assignedBy}</td>
                                <td>{r.assignedTo}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Row>

        </>
    )
}

const SORT_BY = {
    CATEGORY: 'category',
    TOTAL: 'total',
    ASSIGNED: 'assigned',
    AVAILABLE: 'available',
    NOT_AVAILABLE: 'notAvailable',
    REPAIRING: 'repairing',
    WAITING_FOR_RECYCLING: 'waitingForRecycle',
    RECYCLED: 'recycled'
}
