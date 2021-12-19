import React, { useEffect, useState } from 'react';
import { Col, Row, Table, Modal, Form, Dropdown, Button, Pagination, FormCheck } from 'react-bootstrap';
import { HiFilter } from 'react-icons/hi';
import { GrEdit } from 'react-icons/gr';
import { GrEditCus } from '../../../../icon/GrEditCus';
import { CgCloseO } from 'react-icons/cg';
import { GiAutoRepair } from 'react-icons/gi';
import { get, del, post } from '../../../../../httpHelper';
import { BsFillCaretDownFill, BsSearch } from "react-icons/bs";
import { Link, useHistory } from 'react-router-dom'
import './ListAsset.css'
import ModalRepair from './ModalRepair';
import { normalizeString, removeAccents } from '../../../../../utils/StringNormalize'
import ModalNotification from '../../../../ModalNotification';

const elementPerPage = 10;

export default function ListAsset() {
  const [showModalRepair, setShowModalRepair] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [assetSelect, setAssetSelect] = useState('');
  const [assets, setAssets] = useState([]);
  const [showAssets, setShowAssets] = useState(false);
  const [assetInformation, setAssetInformation] = useState();
  const [keySearch, setKeySearch] = useState('');
  const [assetCodeASC, setAssetCodeASC] = useState(true);
  const [assetNameASC, setAssetNameASC] = useState(false);
  const [categoryASC, setCategoryASC] = useState(false);
  const [stateASC, setStateASC] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [stateChecked, setStateChecked] = useState([]);
  const [categoryChecked, setCategoryChecked] = useState([CATEGORY.All]);
  const [categoryNames, setCategoryNames] = useState(['All']);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showError, setShowError] = useState(false)
  const [errorTitle, setErrorTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const history = useHistory();

  useEffect(() => {
    fetchAssets();
    fetchCategoryName();
  }, []);

  const fetchAssets = () => {
    get('/asset')
      .then((response) => {
        if (response.status === 200) {
          let newAssets = response.data;
          if (history.location.state) {
            newAssets.unshift(newAssets.splice(
              newAssets.findIndex((item) => item.assetCode === history.location.state.assetCode), 1)[0]);
          }
          setData(newAssets);
          setAssets(newAssets);

          //Default filter
          setStateChecked([STATE.Assigned, STATE.Available, STATE.Repairing, STATE.Not_available]);
          history.replace();
        } else {
          showErrorNotification('Something wrong!');
        }
      })
      .catch((error) => showErrorNotification('Cannot fetch assets!'));
  };

  const fetchCategoryName = () => {
    get('/category')
      .then((res) => {
        setCategoryNames([...categoryNames, ...res.data.map((category) => category.name)]);
      })
      .catch((error) => showErrorNotification('Fail to connect server!'));
  };

  const handleRowClick = (assetCode) => {
    get(`/asset/${assetCode}`)
      .then(res => {
        setAssetInformation(res.data)
        setShowAssets(true)
      })
      .catch(error => console.log(error))
  };

  const handleSort = (key) => {
    let reverse = -1;
    let list = [];
    if (key === SORT_BY.AssetCode) {
      reverse = assetCodeASC ? -1 : 1;
      setAssetCodeASC(!assetCodeASC);
      list = assets.slice().sort((a, b) => a.assetCode > b.assetCode ? 1 * reverse : b.assetCode > a.assetCode ? -1 * reverse : 0);
    } else if (key === SORT_BY.AssetName) {
      reverse = assetNameASC ? -1 : 1;
      setAssetNameASC(!assetNameASC);
      list = assets.slice().sort((a, b) => a.assetName > b.assetName ? 1 * reverse : b.assetName > a.assetName ? -1 * reverse : 0);
    } else if (key === SORT_BY.Category) {
      reverse = categoryASC ? -1 : 1;
      setCategoryASC(!categoryASC);
      list = assets.slice().sort((a, b) => a.categoryName > b.categoryName ? 1 * reverse : b.categoryName > a.categoryName ? -1 * reverse : 0);
    } else if (key === SORT_BY.State) {
      reverse = stateASC ? -1 : 1;
      setStateASC(!stateASC);
      list = assets.slice().sort((a, b) => a.state > b.state ? 1 * reverse : b.state > a.state ? -1 * reverse : 0);
    }
    setAssets(list);
  };

  const handleKeySearchOnChange = (e) => {
    setKeySearch(e.target.value);
  };

  const filterByAssetCodeOrAssetName = (data, keySearch) => {
    const searchInput = removeAccents(normalizeString(keySearch))
    return data.filter(e =>
      e.assetCode.toLowerCase().includes(searchInput) ||
      e.assetName.toLowerCase().includes(searchInput)
    );
  };

  const handleStateClick = async (e) => {
    if (e === STATE.All) setStateChecked([e]);
    else {
      stateChecked.includes(e)
        ? setStateChecked([...stateChecked.filter((item) => item !== e)])
        : setStateChecked([...stateChecked.filter((item) => item !== STATE.All), e]);
    }
    setCurrentPage(1);
  };

  const handleCategoryClick = async (e) => {
    if (e === 'All') setCategoryChecked(['All']);
    else {
      categoryChecked.includes(e)
        ? setCategoryChecked([...categoryChecked.filter((item) => item !== e)])
        : setCategoryChecked([...categoryChecked.filter((item) => item !== 'All'), e]);
    }
  };

  useEffect(() => {
    let result = [...data];
    result = filterByAssetCodeOrAssetName(data.filter(d =>
      (stateChecked.includes(d.state) || stateChecked.includes('All')) &&
      (categoryChecked.includes(d.categoryName) || categoryChecked.includes('All'))), keySearch
    );

    setAssets(result);
    setCurrentPage(1);
  }, [stateChecked, categoryChecked, keySearch]);

  const handleDeleteClick = (item) => {
    get(`/asset/${item.assetCode}/delete`)
      .then((res) => {
        if (res.data === false) {
          setAssetSelect(item.assetCode);
          showErrorNotification('Cannot delete asset', 'Cannot delete the asset because it belongs to one or more historical assignments or historical repairs. If the asset is not able to be used anymore, please update its state.')
        } else {
          setAssetSelect(item.assetCode);
          setShowModalDelete(true);
        }
      })
      .catch((error) => { });
  };

  const handleCloseModalDelete = () => {
    setAssetSelect('');
    setShowModalDelete(false);
  };

  const handleDelete = () => {
    del(`/asset/${assetSelect}`)
      .then(() => {
        setAssets(
          assets.filter(function (item) {
            return item.assetCode !== assetSelect;
          })
        );
        setAssetSelect('');
        setShowModalDelete(false);
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setShowModalDelete(false);
          showErrorNotification('Cannot delete asset', 'Cannot delete the asset because it belongs to one or more historical assignments or historical repairs. If the asset is not able to be used anymore, please update its state.')
        } else {
          setAssetSelect('');
          setShowModalDelete(false);
          showErrorNotification('Error', error.response && error.response.data.message
            ? error.response.data.message
            : error.message)
        }
      });
  };

  const handleClickRepair = (assetCode) => {
    get(`/asset/${assetCode}`)
      .then(res => {
        if (res.data.state !== 'AVAILABLE')
          showErrorNotification("Asset can be repaired when it is available state!")
        else {
          setSelectedAsset(res.data)
          setShowModalRepair(true)
        }
      })
      .catch(error => showErrorNotification('Get asset error'))
  }

  const handleCloseModalRepair = () => {
    setShowModalRepair(false)
  }

  const handleCreateRepair = (formData) => {
    post('/repair', formData)
      .then(res => {
        get(`/asset/${selectedAsset.assetCode}`)
          .then(assetRes => {
            let newAssets = [...assets]
            const indexInAssets = assets.findIndex(a => a.assetCode === assetRes.data.assetCode)
            newAssets[indexInAssets] = assetRes.data
            setAssets(newAssets)
            let newData = [...data]
            const indexInData = data.findIndex(a => a.assetCode === assetRes.data.assetCode)
            newData[indexInData] = assetRes.data
            setData(newData)
          })
          .catch(error => showErrorNotification('Error get new asset!'))
        handleCloseModalRepair()
      })
      .catch(error => showErrorNotification(error.response.data.message))
  }

  const showErrorNotification = (title, errorMessage) => {
    setShowError(true)
    setErrorTitle(title)
    setErrorMessage(errorMessage)
  }

  return (
    <>
      <ModalRepair
        asset={selectedAsset}
        show={showModalRepair}
        handleClose={handleCloseModalRepair}
        handleSubmit={handleCreateRepair}
      />

      <Modal centered show={showModalDelete} onHide={handleCloseModalDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to delete this asset</Modal.Body>
        <Modal.Footer>
          <Button variant='danger' onClick={handleDelete}>
            Delete
          </Button>
          <Button variant='secondary' onClick={handleCloseModalDelete}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <h3 className="content-title">Asset List</h3>
      <Row>
        <Col>
          <Dropdown autoClose='outside' className='drop-filter'>
            <Button
              className='dropdown-button col-6'
              disabled
              text='State'>
              State
            </Button>
            <Dropdown.Toggle
              className='dropdown-button-filter btn btn-primary'
              id='dropdown-basic'>
              <HiFilter />
            </Dropdown.Toggle>
            <Dropdown.Menu id='drop-show-asset'>
              <div className="dropdown-item checkbox px-3" onClick={() => {
                handleStateClick(STATE.All)
              }}>
                <FormCheck label='All' checked={stateChecked.includes(STATE.All) ? 'checked' : ''} />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Assigned);
                }}>
                <FormCheck
                  label='Assigned'
                  checked={stateChecked.includes(STATE.Assigned) ? 'checked' : ''}
                />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Available);
                }}>
                <FormCheck
                  label='Available'
                  checked={
                    stateChecked.includes(STATE.Available) ? 'checked' : ''
                  }
                />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Repairing);
                }}>
                <FormCheck
                  label='Repairing'
                  checked={
                    stateChecked.includes(STATE.Repairing) ? 'checked' : ''
                  }
                />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Not_available);
                }}>
                <FormCheck
                  label='Not available'
                  checked={
                    stateChecked.includes(STATE.Not_available) ? 'checked' : ''
                  }
                />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Waiting_for_recycling);
                }}>
                <FormCheck
                  label='Waiting for recycling'
                  checked={
                    stateChecked.includes(STATE.Waiting_for_recycling)
                      ? 'checked'
                      : ''
                  }
                />
              </div>
              <div
                className='dropdown-item checkbox px-3'
                onClick={() => {
                  handleStateClick(STATE.Recycled);
                }}>
                <FormCheck
                  label='Recycled'
                  checked={stateChecked.includes(STATE.Recycled) ? 'checked' : ''}
                />
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
          <Dropdown autoClose='outside' className='drop-filter'>
            <Button
              className='dropdown-button col-6'
              disabled
              text='State'>
              Category
            </Button>
            <Dropdown.Toggle
              className='dropdown-button-filter btn btn-primary'
              id='dropdown-basic'>
              <HiFilter />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {categoryNames.map((category, index) =>
                <div key={index} className='dropdown-item checkbox px-3' onClick={() => { handleCategoryClick(category) }}>
                  <FormCheck label={category} checked={categoryChecked.includes(category) ? 'checked' : ''} />
                </div>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
          <div className='float-end'>
            <div className='input-group'>
              <div className='form-outline'>
                <input
                  value={keySearch}
                  onChange={handleKeySearchOnChange}
                  type='search'
                  id='keySearch'
                  className='form-control search-input'
                  placeholder='Search'
                />
              </div>
              <button type='button' className='btn btn-primary' disabled={true}>
                <BsSearch style={{}} />
              </button>
            </div>
          </div>
        </Col>
        <Col>
          <div className='float-end'>
            <Link className='btn' style={{ color: '#FFF', backgroundColor: '#CF2338', borderColor: '#CF2338' }} to='/assets/create'> Create new asset</Link>
          </div>
        </Col>
      </Row>
      <Row>
        <Table className="content-table" responsive>
          <thead>
            <tr>
              <th className='w-17 table-thead' onClick={() => handleSort(SORT_BY.AssetCode)}>
                Asset Code
                <BsFillCaretDownFill />
              </th>
              <th className='w-37 table-thead' onClick={() => handleSort(SORT_BY.AssetName)}>
                Asset Name
                <BsFillCaretDownFill />
              </th>
              <th className='w-17 table-thead' onClick={() => handleSort(SORT_BY.Category)}>
                Category
                <BsFillCaretDownFill />
              </th>
              <th className='w-17 table-thead' onClick={() => handleSort(SORT_BY.State)}>
                State
                <BsFillCaretDownFill />
              </th>
              <th className='w-14'></th>
            </tr>
          </thead>
          <tbody>
            {assets &&
              assets
                .slice(
                  (currentPage - 1) * elementPerPage,
                  currentPage * elementPerPage
                )
                .map((a) => (
                  <tr key={a.assetCode}>
                    <td onClick={() => handleRowClick(a.assetCode)}>
                      {a.assetCode}
                    </td>
                    <td onClick={() => handleRowClick(a.assetCode)}>
                      {a.assetName}
                    </td>
                    <td onClick={() => handleRowClick(a.assetCode)}>
                      {a.categoryName}
                    </td>
                    <td onClick={() => handleRowClick(a.assetCode)}>
                      {StateToLowCase[a.state]}
                    </td>
                    <td>
                      <div className='d-flex justify-content-evenly align-items-center'>
                        {(a.state !== STATE.Repairing && a.state !== STATE.Assigned) ?
                          <>
                            <GiAutoRepair style={{ fontSize: "130%", cursor: "pointer" }} onClick={() => handleClickRepair(a.assetCode)} />
                            <Link to={'/assets/' + a.assetCode}>
                              <GrEdit style={editIconStyle} />
                            </Link>
                            <CgCloseO style={deleteIconStyle} onClick={() => handleDeleteClick(a)} />
                          </>
                          :
                          <>
                            <GiAutoRepair style={{ fontSize: "130%", color: "#ccc" }} />
                            <GrEditCus color='#ccc' />
                            <CgCloseO style={iconDisabled} />
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
      <Col className='float-end'>
        <Pagination size='sm'>
          <Pagination.Prev
            disabled={currentPage < 2}
            onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </Pagination.Prev>
          <Pagination.Item
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{ display: currentPage < 2 && 'none' }}>
            {currentPage - 1}
          </Pagination.Item>
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Item
            hidden={currentPage >= Math.ceil(assets.length / elementPerPage)}
            disabled={currentPage === Math.ceil(assets.length / elementPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}>
            {currentPage + 1}
          </Pagination.Item>
          <Pagination.Next
            disabled={currentPage >= Math.ceil(assets.length / elementPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </Pagination.Next>
        </Pagination>
      </Col>
      <Modal
        show={showAssets}
        onHide={() => setShowAssets(false)}
        centered
        id="modal-content-asset"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#CF2338', backgroundColor: '#FAFCFC' }}>
            Detailed Asset Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#FAFCFC' }}>
          <Form className='modal-detail-asset'>
            <Form.Group as={Row}>
              <Form.Label column sm='3' className='pr-0'>
                Asset Code
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assetInformation && assetInformation.assetCode}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Asset Name
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assetInformation && assetInformation.assetName}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Category
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={
                    assetInformation && assetInformation.categoryName
                  }
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Installed Date
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={
                    assetInformation && assetInformation.installedDate
                  }
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                State
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assetInformation && StateToLowCase[assetInformation.state]}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Location
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assetInformation && assetInformation.location}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Specfication
              </Form.Label>
              <Col sm='9'>
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={assetInformation && assetInformation.specification}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Assignment history
              </Form.Label>
              <Col sm='9'>
                {
                  assetInformation && assetInformation.assignmentDetails ? (
                    <div className="table-wrapper">
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
                          {assetInformation.assignmentDetails.map((ad, index) => (
                            <tr key={index}>
                              <td>{ad.assignedDate}</td>
                              <td>{ad.assignedTo}</td>
                              <td>{ad.assignedBy}</td>
                              <td>{ad.returnedDate ? ad.returnedDate : ""}</td>
                            </tr>
                          ))}
                          {/* <tr >
                            <td>12/01/2021</td>
                            <td>nguyenkt</td>
                            <td>nguyenkt</td>
                            <td>8/12/2021</td>
                          </tr> */}
                        </tbody>
                      </Table>
                    </div>
                  ) : <></>
                }
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='3'>
                Repair history
              </Form.Label>
              <Col sm='9'>
                {
                  assetInformation && assetInformation.repairs ? (
                    <div className="table-wrapper">
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
                          {assetInformation.repairs.map((r, index) => (
                            <tr key={index}>
                              <td>{r.startedDate}</td>
                              <td>{r.note}</td>
                              <td>{r.createdBy}</td>
                              <td>{r.finishedDate ? r.returnedDate : ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : <></>
                }
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalNotification
        title={errorTitle}
        content={errorMessage}
        show={showError}
        setShow={setShowError}
      />
    </>
  );
}

const SORT_BY = {
  AssetCode: 'AssetCode',
  AssetName: 'AssetName',
  Category: 'Category',
  State: 'State',
};
const STATE = {
  All: 'All',
  Assigned: 'ASSIGNED',
  Available: 'AVAILABLE',
  Not_available: 'NOT_AVAILABLE',
  Waiting_for_recycling: 'WAITING_FOR_RECYCLING',
  Recycled: 'RECYCLED',
  Repairing: 'REPAIRING'
};
const StateToLowCase = {
  ASSIGNED: 'Assigned',
  AVAILABLE: 'Available',
  NOT_AVAILABLE: 'Not available',
  WAITING_FOR_RECYCLING: 'Waiting for recycling',
  RECYCLED: 'Recycled',
  REPAIRING: 'Reparing'
};
const CATEGORY = {
  All: 'All',
};

const deleteIconStyle = {
  cursor: 'pointer',
  color: 'red',
  fontSize: '130%',
};

const iconDisabled = {
  color: '#ccc',
  fontSize: '130%',
};

const editIconStyle = {
  fontSize: '130%',
};
