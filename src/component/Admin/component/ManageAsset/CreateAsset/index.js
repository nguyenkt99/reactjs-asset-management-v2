import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import './CreateAsset.css';
import { Link, useHistory } from 'react-router-dom';
import { FaAngleDown, FaCheck, FaTimes } from 'react-icons/fa';
import { del, get, post, put } from '../../../../../httpHelper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaEdit } from 'react-icons/fa';
import moment from 'moment';

let categoryPrefix = 0;
export default function AssetCreate() {
  let history = useHistory();

  const [headerTitle, setHeaderTitle] = useState('');
  const [show, setShow] = useState(false);
  const [display, setdisplay] = useState(false);
  const [errorAddCategory, setErrorAddCategory] = useState('');
  const [errorNameAsset, setErrorNameAsset] = useState('');
  const [errorSpeAsset, setErrorSpeAsset] = useState('');
  const [installedDate, setInstalledDate] = useState('');
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
  const [showModalEditCategory, setShowModalEditCategory] = useState(false);
  const [errorMessageCategoryEdit, setErrorMessageCategoryEdit] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryEdit, setCategoryEdit] = useState();
  const [showModalDeleteCategory, setShowModalDeleteCategory] = useState(false);
  const [showModalErrorDeleteCategory, setShowModalErrorDeleteCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputs, setInputs] = useState({
    assetName: '',
    specification: '',
    installedDate: '',
    categoryPrefix: '',
    state: 'AVAILABLE',
  });
  const [inputAddCategory, setInputAddCategory] = useState({
    prefix: '',
    name: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    get('/category')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((error) => {
        console.log(error);
        setErrorAddCategory(error);
      });
  };

  const preSave = () => {
    let check = true;

    if (inputs.assetName === '') {
      check = false;
    }
    if (inputs.specification === '') {
      check = false;
    }
    if (installedDate === '') {
      check = false;
    }
    if (inputs.categoryPrefix === '') {
      check = false;
    }
    if (inputs.state === '') {
      check = false;
    }
    return check;
  };

  const preAddCate = () => {
    let check = true;

    if (inputAddCategory.name.replace(/\s/g, '') === '') {
      check = false;
    }
    if (inputAddCategory.prefix === '') {
      check = false;
    }

    if (inputAddCategory.prefix.length < 2 || inputAddCategory.prefix.length > 2) {
      check = false;
    }

    return check;
  };

  const handleOnChange = (e) => {
    // console.log(e);
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnChangeAdd = (e) => {
    let value = e.target.value;

    if (e.target.name === 'prefix') {
      value = value.replace(/[^A-Za-z]/gi, '');
    } else {
      value = value.replace(/[^A-Za-z\s]/gi, '');
      // value = value.replace(/\s+/g, ' ').trim();
    }
    // console.log('vl', value);
    setInputAddCategory((prevState) => ({
      ...prevState,
      [e.target.name]: value,
    }));
  };

  // const onChangeNameCategory = (e) => {
  //   console.log(e.target.value, 'xxx', e.target.name);
  //   setNameCategory(e.target.value);
  // };

  // const onChangePrefixCategory = (e) => {
  //   console.log(e.target.value, '', e.target.name);
  //   setPrefixCategory(e.target.value);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorNameAsset('');
    setErrorSpeAsset('');
    let check = true;
    if (inputs.assetName.length < 10) {
      setErrorNameAsset(
        `Please lengthen this text to 10 character or more (you are currently using ${inputs.assetName.length} character`
      );
      check = false;
    }
    if (inputs.assetName.length > 40) {
      setErrorNameAsset(
        `Please lengthen this text max 40 character or less (you are currently using ${inputs.assetName.length} character`
      );
      check = false;
    }
    if (inputs.specification.length < 20) {
      setErrorSpeAsset(
        `Please lengthen this text to 20 character or more (you are currently using ${inputs.assetName.length} character`
      );
      check = false;
    }
    if (inputs.specification.length > 80) {
      setErrorSpeAsset(
        `Please lengthen this text max 80 character or less (you are currently using ${inputs.assetName.length} character`
      );
      check = false;
    }

    if (check === false) {
      return;
    }

    inputs.installedDate = installedDate.split('-').reverse().join('/');

    setIsSaving(true);
    post('/asset', inputs)
      .then((res) => {
        history.push({
          pathname: './manage-asset',
          state: {
            assetCode: res.data.assetCode,
          },
        });
      })
      .catch((error) => {
        setIsSaving(false);
        console.log(error);
      });
  };

  const handleOnClickAdd = () => {
    setShow(true);
  };

  const onChangeSelected = (item) => {
    if (show !== true) {
      setdisplay(!display);
      setHeaderTitle(item.name);
      // setCategory(item.name);

      setInputs((prevState) => ({
        ...prevState,
        categoryPrefix: item.prefix,
      }));
    } else {
    }
  };

  const removeNewCategory = () => {
    setInputAddCategory({
      name: '',
      prefix: '',
    });
    setErrorAddCategory('');
    setShow(false);
  };

  const addNewCategory = () => {
    console.log(inputAddCategory);
    if (!preAddCate()) {
      return;
    }

    inputAddCategory.prefix = inputAddCategory.prefix.toUpperCase();
    inputAddCategory.name = inputAddCategory.name.replace(/\s+/g, ' ').trim();

    setErrorAddCategory('');

    post('/category', inputAddCategory)
      .then((res) => {
        setCategories([
          ...categories,
          { name: res.data.name, prefix: res.data.prefix },
        ]);

        setShow(false);
        setInputAddCategory({
          name: '',
          prefix: '',
        });
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setErrorAddCategory(
            'Category is already exists. Please enter a different category'
          );
        } else {
          setErrorAddCategory(
            'Prefix is already exists. Please enter a different prefix'
          );
        }
      });
  };

  const handleDisplay = () => {
    if (show !== true) {
      setShow(false);
      setdisplay(!display);
    } else {
    }
  };

  const openDatePicker = () => {
    setIsOpenDatePicker(!isOpenDatePicker);
  }

  const handleClickEditCategory = (category) => {
    // console.log(category);
    setShowModalEditCategory(true);
    setCategoryEdit(category);
    console.log(category)
  }

  const handleClickDeleteCategory = (prefix) => {
    categoryPrefix = prefix;
    setShowModalDeleteCategory(true);
  }

  const handleEditCategory = () => {
    categoryEdit.name = categoryEdit.name.replace(/\s+/g, ' ').trim();
    put(`/category/${categoryEdit.prefix}`, categoryEdit)
      .then((res) => {
        // console.log(res.data);
        fetchCategories();
        handleClose();
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 409) {
          setErrorMessageCategoryEdit('Category is already existed. Please enter a different category');
        }
      });
  }

  const handleDeleteCategory = () => {
    del(`/category/${categoryPrefix}`)
      .then((res) => {
        if (res.status === 200) {
          fetchCategories();
          showModalDeleteCategory(false);
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 409) {
            setShowModalDeleteCategory(false);
            setShowModalErrorDeleteCategory(true);
          }
        }
      })
      .finally(() => {
        setShowModalDeleteCategory(false);
        // setShowModalErrorDeleteCategory(false);
      });
  }

  const handleOnChangeCategoryEdit = (e) => {
    setCategoryEdit((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value.replace(/[^A-Za-z\s]/gi, ''),
    }));
  }

  const handleClose = () => {
    setShowModalEditCategory(false);
    setErrorMessageCategoryEdit('');
  }

  const handleCloseModalDeleteCategory = () => {
    setShowModalDeleteCategory(false);
  }

  return (
    <>
      <h5 className="content-title">Create asset</h5>
      <Col xs={6}>
        <Form onSubmit={handleSubmit} className="content-form">
          <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={3}>
              Name
            </Form.Label>
            <Col>
              <Form.Control name='assetName' type='text' required onChange={handleOnChange} />
              <span id='error'>{errorNameAsset}</span>
            </Col>
          </Form.Group>
          <Row className="align-items-center mb-3">
            <Col sm={3}>
              <div className='category_area'>
                <div className='label'>
                  <span>Category</span>
                </div>
              </div>
            </Col>
            <Col>
              <div className='category_input'>
                <div className='boder_search' onClick={handleDisplay}>
                  {headerTitle}
                  <FaAngleDown className='angledown' />
                </div>
                <div
                  className='list_below'
                  style={{ display: display ? 'block' : 'none' }}>
                  <ul id='list'>
                    {categories.map((item) => (
                      <li className="category_item">
                        <span className="name_area" onClick={() => onChangeSelected(item)}>{item.name}</span>
                        <div className="icon_area">
                          <FaEdit className='times' onClick={() => handleClickEditCategory(item)} />
                          <FaTimes className='times' onClick={() => handleClickDeleteCategory(item.prefix)} />
                        </div>
                      </li>
                    ))}

                    {show === true ? (
                      <li id='end_li'>
                        <div className='add_cate'>
                          <div className='left'>
                            <input
                              id='input_add'
                              value={inputAddCategory.name}
                              maxLength={20}
                              minLength={1}
                              name='name'
                              onChange={handleOnChangeAdd}></input>
                          </div>
                          <div className='right'>
                            <input
                              id='input_add'
                              value={inputAddCategory.prefix}
                              maxLength={2}
                              minLength={2}
                              name='prefix'
                              onChange={handleOnChangeAdd}></input>
                          </div>
                          <div className='right'>
                            <FaCheck
                              className='check'
                              onClick={addNewCategory}
                            />
                            <FaTimes
                              className='times'
                              onClick={removeNewCategory}
                            />
                          </div>
                        </div>
                        <span id='error'>{errorAddCategory}</span>
                      </li>
                    ) : (
                      <></>
                    )}
                    {show === false ? (
                      <li id='end_li'>
                        <div className='add_cate'>
                          {show === false ? (
                            <Button
                              id='link'
                              variant='link'
                              onClick={handleOnClickAdd}>
                              Add new category
                            </Button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </li>
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              </div>
            </Col>
          </Row>

          <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={3}>
              Specification
            </Form.Label>
            <Col>
              <Form.Control
                className="textarea-input"
                name='specification'
                as='textarea'
                required
                onChange={handleOnChange}
              />
              <span id='error'>{errorSpeAsset}</span>
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className='mb-3'
            required
            controlId='installedDate'>
            <Form.Label column sm={3}>
              Installed Date
            </Form.Label>
            <Col>
              <div className="datepicker">
                <DatePicker className="form-control"
                  dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                  onKeyDown={(e) => e.preventDefault()}
                  selected={installedDate && new Date(installedDate)}
                  onChange={(date) => setInstalledDate(moment(date).format('YYYY-MM-DD'))}
                  placeholderText="dd/MM/yyyy"
                  onClickOutside={openDatePicker}
                  onSelect={openDatePicker}
                  onFocus={openDatePicker}
                  open={isOpenDatePicker}
                />
                <FaCalendarAlt className="icon-date" onClick={openDatePicker} />
              </div>
            </Col>
          </Form.Group>
          <fieldset>
            <Form.Group as={Row} className='mb-3 align-items-center'>
              <Form.Label as='legend' column sm={3}>
                State
              </Form.Label>

              <Col xs={4}>
                <Form.Check
                  type='radio'
                  label='Available'
                  name='state'
                  id='available'
                  required
                  defaultChecked
                  value='AVAILABLE'
                  onChange={handleOnChange}
                />
                <Form.Check
                  type='radio'
                  label='Not available'
                  name='state'
                  id='notavailable'
                  required
                  value='NOT_AVAILABLE'
                  onChange={handleOnChange}
                />
              </Col>
            </Form.Group>
          </fieldset>

          <Form.Group as={Row} className='float-end mb-3'>
            <Col>
              {!isSaving ?
                <Button variant='danger' type='submit' disabled={!preSave()}>
                  Save
                </Button>
                :
                <Button variant="danger" type="submit" disabled>
                  <Spinner animation="border" size="sm" variant="light" />Save
                </Button>
              }
              <Link
                className='btn btn-outline-secondary'
                style={{ marginLeft: '40px' }}
                to='/manage_asset'>
                Cancel
              </Link>
            </Col>
          </Form.Group>
        </Form>
      </Col>
      <Modal size="sm" centered show={showModalEditCategory} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" >
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={categoryEdit && categoryEdit.name} onChange={handleOnChangeCategoryEdit} />
              {errorMessageCategoryEdit &&
                < Form.Control.Feedback className="d-block" type="invalid">
                  {errorMessageCategoryEdit}
                </Form.Control.Feedback>
              }
            </Form.Group>
            <Form.Group className="mb-3" >
              <Form.Label>Prefix</Form.Label>
              <Form.Control type="text" name="prefix" readOnly value={categoryEdit && categoryEdit.prefix} onChange={handleOnChangeCategoryEdit} />
            </Form.Group>
            <Form.Group className="float-end">
              <Button variant="danger" onClick={handleEditCategory}>
                Save
              </Button>
              <Button variant="outline-secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal size="sm" centered show={showModalDeleteCategory} onHide={handleCloseModalDeleteCategory}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to delete this category?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteCategory}>
            Delete
          </Button>
          <Button variant="outline-secondary" onClick={handleCloseModalDeleteCategory}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModalErrorDeleteCategory} onHide={() => setShowModalErrorDeleteCategory(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Can not delete this category</Modal.Title>
        </Modal.Header>
        <Modal.Body>This category already has asset!</Modal.Body>
      </Modal>
    </>
  );
}
