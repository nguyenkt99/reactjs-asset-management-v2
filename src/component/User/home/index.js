import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Table, Modal, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./UserAssignment.css";
import { FaUndo } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { get, put, post } from '../../../httpHelper';
import { BsFillCaretDownFill } from "react-icons/bs";
import { HiInformationCircle } from "react-icons/hi";

export default function UserAssignment() {
  const assignmentIdRef = useRef()
  const [assignments, setAssignments] = useState([]);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentInformation, setAssignmentInformation] = useState();
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState('');
  const [idASC, setIDASC] = useState(false);
  const [assetCodeASC, setAssetCodeASC] = useState(true);
  const [assetNameASC, setAssetNameASC] = useState(false);
  const [categoryASC, setCategoryASC] = useState(false);
  const [assignedDateASC, setAssignedDateASC] = useState(false);
  const [stateASC, setStateASC] = useState(false);
  const [data, setData] = useState([]);
  const [showModalAccept, setShowModalAccept] = useState(false);
  const [showModalDeclined, setShowModalDeclined] = useState(false);
  const [showModalRequest, setShowModalRequest] = useState(false);
  const [note, setNote] = useState('');
  const [selectingAssets, setSelectingAssets] = useState([])

  useEffect(() => {
    fetchUserAssignment();
  }, []);

  const fetchUserAssignment = () => {
    get('/assignment/home')
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          const dataWithStrAssets = data.map(u => {
            let strAssets = '';
            u.assignmentDetails.forEach(ad => {
              strAssets += `${ad.assetCode}, `;
            })
            return { ...u, strAssets: strAssets.substring(0, strAssets.length - 2) }
          })

          setData(dataWithStrAssets);
          setAssignments(dataWithStrAssets);
        } else {
          toastMessage("Something wrong!");
        }
      })
      .catch((error) => toastMessage("Fail to connect server!"));
  };

  const toastMessage = (message) => {
    setMessage(message);
    setShowToast(true);
  };

  const handleRowClick = (assignmentID) => {
    var assignment = assignments.find(
      (assignment) => assignment.id === assignmentID
    );
    setAssignmentInformation(assignment);
    setShowAssignment(true);
  };

  const handleSort = (key) => {
    let reverse = -1;
    let list = [];
    if (key === SORT_BY.id) {
      reverse = idASC ? -1 : 1;
      setIDASC(!idASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.id > b.id
            ? 1 * reverse
            : b.id > a.id
              ? -1 * reverse
              : 0
        );
    } else if (key === SORT_BY.AssetCode) {
      reverse = assetCodeASC ? -1 : 1;
      setAssetCodeASC(!assetCodeASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.assetCode > b.assetCode
            ? 1 * reverse
            : b.assetCode > a.assetCode
              ? -1 * reverse
              : 0
        );
    } else if (key === SORT_BY.AssetName) {
      reverse = assetNameASC ? -1 : 1;
      setAssetNameASC(!assetNameASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.assetName > b.assetName
            ? 1 * reverse
            : b.assetName > a.assetName
              ? -1 * reverse
              : 0
        );
    } else if (key === SORT_BY.Category) {
      reverse = categoryASC ? -1 : 1;
      setCategoryASC(!categoryASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.category > b.category
            ? 1 * reverse
            : b.category > a.category
              ? -1 * reverse
              : 0
        );
    } else if (key === SORT_BY.AssignedDate) {
      reverse = assignedDateASC ? -1 : 1;
      setAssignedDateASC(!assignedDateASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.assignedDate > b.assignedDate
            ? 1 * reverse
            : b.assignedDate > a.assignedDate
              ? -1 * reverse
              : 0
        );
    } else if (key === SORT_BY.State) {
      reverse = stateASC ? -1 : 1;
      setStateASC(!stateASC);
      list = assignments
        .slice()
        .sort((a, b) =>
          a.state > b.state ? 1 * reverse : b.state > a.state ? -1 * reverse : 0
        );
    }
    setAssignments(list);
  };

  const handleAccept = () => {
    put(`/assignment/staff/${assignmentIdRef.current}`, { state: "ACCEPTED" })
      .then((res) => {
        setData(data.filter(e => {
          if (e.id === assignmentIdRef.current)
            e.state = res.data.state
          return e
        }))
        setAssignments(assignments.filter(e => {
          if (e.id === assignmentIdRef.current)
            e.state = res.data.state
          return e
        }))
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            setMessage('Logout and then login!')
          }
        } else {
          setMessage(error.response.data.errorCode)
        }
        setShowToast(true)
      }).finally(() => setShowModalAccept(false));
  }

  const handleDeclined = () => {
    put(`/assignment/staff/${assignmentIdRef.current}`, { state: "DECLINED", note: note })
      .then((res) => {
        // setData(data.filter(e => e.id !== assignmentIdRef.current))
        // setAssignments(assignments.filter(e => e.id !== assignmentIdRef.current))

        const index = assignments.findIndex(item => item.id === assignmentIdRef.current);
        let newAssignments = assignments;
        let item = { ...newAssignments[index] };
        item.state = STATE.DECLINED;
        item.note = note;
        newAssignments[index] = item;
        setAssignments(newAssignments);
        setData(newAssignments);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            setMessage('Logout and then login!')
          }
        } else {
          setMessage(error.response.data.errorCode)
        }
        setShowToast(true)
      }).finally(() => setShowModalDeclined(false));
  }

  // const handleRequestForReturning = (assignmentId) => {
  //   post(`/request`, { assignmentId: assignmentId })
  //     .then((response) => {
  //       console.log(response);
  //       // fetchAssignments();
  //       const index = assignments.findIndex(item => item.id === assignmentId);
  //       let newAssignments = assignments;
  //       let item = { ...newAssignments[index] };
  //       item.isCreatedRequest = true;
  //       item.state = STATE.WAITING_FOR_RETURNING;
  //       newAssignments[index] = item;
  //       setAssignments(newAssignments);
  //       setData(newAssignments);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })
  //     .finally(() => setShowModalRequest(false));
  // }

  const handleCreateRequestReturn = () => {
    let formData = {
      assignmentId: assignmentIdRef.current,
      assignmentDetails: selectingAssets.map(assetCode => ({ assetCode: assetCode }))
    }

    post(`/request-return`, formData)
      .then((response) => {
        // fetchAssignments();
        let newAssignments = [...assignments]
        const index = assignments.findIndex(item => item.id === assignmentIdRef.current)
        get(`/assignment/${assignmentIdRef.current}`)
          .then(res => {
            let newAssignment = res.data
            let strAssets = ''
            newAssignment.assignmentDetails.forEach(ad => {
              strAssets += `${ad.assetCode}, `
            })
            newAssignments[index] = { ...newAssignment, strAssets }
            setAssignments(newAssignments)
            setData(newAssignments)
          })
          .catch(error => console.log(error.response))
      })
      // .catch((error) => {
      //   if (error.response) {
      //     if (error.response.status === 404) {
      //       setErrMessage('Error: ID not found')
      //     } else if (error.response.status === 409) {
      //       setErrMessage('Error: Conflict')
      //     }
      //   } else {
      //     setErrMessage('Connection Error!')
      //   }
      //   setShowToastError(true)
      // })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setShowModalRequest(false));
  }

  const handleAcceptClick = (id) => {
    assignmentIdRef.current = id
    setShowModalAccept(true)
  }

  const handleDeclineClick = (id) => {
    assignmentIdRef.current = id
    setShowModalDeclined(true)
  }

  const onClickRequestForReturning = (id) => {
    assignmentIdRef.current = id;
    const assignment = assignments.find((assignment) => assignment.id === id);
    setAssignmentInformation(assignment);
    setShowModalRequest(true);
  };

  const assetOnChange = (e) => {
    const assetCode = e.target.value;
    if (selectingAssets.includes(assetCode)) {
      setSelectingAssets([...selectingAssets.filter(a => a !== assetCode)])
    } else {
      setSelectingAssets([...selectingAssets, assetCode])
    }
  }

  return (
    <div>
      <h5 className="content-title">My Assignment</h5>
      <Row>
        <Table className="content-table" responsive>
          <thead>
            <tr>
              <th style={{ width: "48px" }}>
                No.
                <BsFillCaretDownFill />
              </th>
              <th style={{ width: "300px" }}>
                Asset List
                <BsFillCaretDownFill />
              </th>
              <th onClick={() => handleSort(SORT_BY.AssignedDate)}>
                Assigned Date
                <BsFillCaretDownFill />
              </th>
              <th onClick={() => handleSort(SORT_BY.State)}>
                State
                <BsFillCaretDownFill />
              </th>
              <th className="w-14"></th>
            </tr>
          </thead>
          <tbody>
            {assignments &&
              assignments
                .map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.id}
                    </td>
                    <td className="asset-name-list" onClick={() => handleRowClick(a.id)}>
                      {a.strAssets}
                    </td>
                    <td onClick={() => handleRowClick(a.id)}>
                      {a.assignedDate}
                    </td>
                    <td onClick={() => handleRowClick(a.id)}>
                      {StateToLowCase[a.state]}
                    </td>
                    <td>
                      <div className="d-flex justify-content-evenly">
                        {a.state === STATE.WAITING_FOR_ACCEPTANCE ?
                          <>
                            <FontAwesomeIcon style={{ cursor: "pointer" }} color="red" size="lg" icon={faCheck} onClick={() => handleAcceptClick(a.id)} />
                            <FontAwesomeIcon style={{ cursor: "pointer" }} size="lg" icon={faTimes} onClick={() => handleDeclineClick(a.id)} />
                            <FaUndo id="undo-assignment" style={{ color: '#ccc' }} />
                          </>
                          :
                          <>
                            <FontAwesomeIcon color="#ccc" size="lg" icon={faCheck} />
                            <FontAwesomeIcon color="#ccc" size="lg" icon={faTimes} />
                            {a.state === STATE.ACCEPTED && !a.isCreatedRequest ?
                              <FaUndo id="undo-assignment" style={{ cursor: 'pointer' }} onClick={() => onClickRequestForReturning(a.id)} />
                              :
                              <FaUndo id="undo-assignment" style={{ color: '#ccc' }} />
                            }
                          </>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
      </Row>
      <br />
      <Modal show={showAssignment} onHide={() => setShowAssignment(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#CF2338', backgroundColor: '#FAFCFC' }}>
            Detailed Assignment Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#FAFCFC' }}>
          <Form className='modal-detail-asset'>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Id
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.id}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Assigned To
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.assignedTo}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Assigned By
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.assignedBy}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Assigned Date
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.assignedDate}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Returned Date
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.intendedReturnDate}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                State
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && StateToLowCase[assignmentInformation.state]}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
              <Form.Label column sm='4' className='pr-0'>
                Note
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  as="textarea"
                  plaintext
                  readOnly
                  defaultValue={assignmentInformation && assignmentInformation.note}
                />
              </Col>
            </Form.Group>

            {/* Assignment details */}
            <Row>
              <Table >
                <thead className="fix_width">
                  <tr className="fix_width">
                    <th style={{ width: "100px" }}>Asset Code</th>
                    <th style={{ width: "170px" }}>Asset Name</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody className="table-content fix_width">
                  {assignmentInformation && assignmentInformation.assignmentDetails.map(ad => (
                    <tr key={ad.assetCode} className="fix_width">
                      <td style={{ width: "100px" }}>{ad.assetCode}</td>
                      <td style={{ width: "170px" }}>
                        <span>{ad.assetName}</span>
                        <OverlayTrigger
                          key={ad.assetCode}
                          placement="bottom"
                          overlay={
                            <Tooltip className="tooltip-text">
                              {ad.specs}
                            </Tooltip>
                          }
                        >
                          <span className="asset-name__icon"><HiInformationCircle /></span>
                        </OverlayTrigger>
                      </td>
                      <td>{StateToLowCase[ad.state]}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal centered show={showModalAccept}>
        <Modal.Header>
          <Modal.Title className="modal-title">Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to accept this assignment?</Modal.Body>
        <Modal.Footer>
          <Button variant='danger' onClick={handleAccept}>
            Accept
          </Button>
          <Button variant='secondary' onClick={() => setShowModalAccept(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={showModalDeclined}>
        <Modal.Header>
          <Modal.Title className="modal-title">Are you sure decline this assignment?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group as={Row} className='mb-3' controlId='note'>
            <Form.Label column sm={1}>
              Note
            </Form.Label>
            <Col>
              <Form.Control className="textarea-input" name='note' as='textarea' required maxLength={100} onChange={(e) => setNote(e.target.value)} />
            </Col>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='danger' onClick={handleDeclined} disabled={note === ''}>
            Decline
          </Button>
          <Button variant='secondary' onClick={() => setShowModalDeclined(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal return */}
      <Modal centered show={showModalRequest} onHide={() => setShowModalRequest(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create request for returning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table >
            <thead className="fix_width">
              <tr className="fix_width">
                <th style={{ width: "22px" }}></th>
                <th style={{ width: "100px" }}>Asset Code</th>
                <th style={{ width: "180px" }}>
                  Asset Name
                </th>
                <th>State</th>
              </tr>
            </thead>
            <tbody className="table-content fix_width">
              {assignmentInformation && assignmentInformation.assignmentDetails.map(ad => (
                <tr key={ad.assetCode} className="fix_width">
                  <td style={{ width: "22px" }}>
                    <input id={ad.assetCode}
                      disabled={ad.state === STATE.WAITING_FOR_RETURNING || ad.state === STATE.COMPLETED}
                      type="checkbox"
                      name="assetCheckbox"
                      value={ad.assetCode}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => assetOnChange(e)} />
                  </td>
                  <td style={{ width: "100px" }}>
                    {ad.assetCode}
                  </td>
                  <td style={{ width: "180px" }}>
                    <span>{ad.assetName}</span>
                    <OverlayTrigger
                      key={ad.assetCode}
                      placement="bottom"
                      overlay={
                        <Tooltip className="tooltip-text">
                          {ad.specs}
                        </Tooltip>
                      }
                    >
                      <span className="asset-name__icon"><HiInformationCircle /></span>
                    </OverlayTrigger>
                  </td>
                  <td>{StateToLowCase[ad.state]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='danger' onClick={handleCreateRequestReturn}>
            Save
          </Button>
          <Button variant='secondary' onClick={() => setShowModalRequest(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
const SORT_BY = {
  id: "id",
  AssetCode: "AssetCode",
  AssetName: "AssetName",
  Category: "Category",
  AssignedDate: "AssignedDate",
  State: "State",
};
const STATE = {
  All: "All",
  ACCEPTED: "ACCEPTED",
  WAITING_FOR_ACCEPTANCE: "WAITING_FOR_ACCEPTANCE",
  DECLINED: "DECLINED",
  WAITING_FOR_RETURNING: "WAITING_FOR_RETURNING",
  COMPLETED: "COMPLETED"
};
const StateToLowCase = {
  ACCEPTED: "Accepted",
  WAITING_FOR_ACCEPTANCE: "Waiting for acceptance",
  DECLINED: "Declined",
  WAITING_FOR_RETURNING: "Waiting for returning",
  COMPLETED: 'Completed'
};
