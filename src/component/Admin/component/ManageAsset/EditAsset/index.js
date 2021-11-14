import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { FaAngleDown, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { get, put } from '../../../../../httpHelper';
import { withRouter } from 'react-router-dom';

function EditAsset(props) {
  let history = useHistory();
  const [errorNameAsset, setErrorNameAsset] = useState('');
  const [errorSpeAsset, setErrorSpeAsset] = useState('');
  const [installedDate, setInstalledDate] = useState('');
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false);
  const [inputs, setInputs] = useState({
    assetName: '',
    specification: '',
    installedDate: '',
    categoryName: '',
    state: 'AVAILABLE',
    categoryPrefix: ''
  });

  /*assetCode assetName  state specification installedDate location categoryPrefix */

  useEffect(() => {
    fetchAsset();
  }, []);

  const assetCode = props.match.params.assetCode;
  const fetchAsset = () => {
    get(`/asset/${assetCode}`)
      .then((res) => {
        console.log(res.data)
        let installedDate = res.data.installedDate.split("/").reverse().join("-")
        let object = {
          assetName: res.data.assetName,
          specification: res.data.specification,
          installedDate: installedDate,
          categoryName: res.data.categoryName,
          state: res.data.state,
          categoryPrefix: res.data.categoryPrefix
        }
        setInstalledDate(installedDate);
        setInputs(object);
      })
      .catch(err => {
        console.log(err)
        // history.push({
        //   pathname: '/manage_asset',
        // });
      })
  }

  const preSave = () => {
    let check = true;

    if (inputs.assetName === '') {
      check = false;
    }
    if (inputs.specification === '') {
      check = false;
    }
    if (inputs.installedDate === '') {
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

  const handleOnChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputs);
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
    if (inputs.specification.length < 10) {
      setErrorSpeAsset(
        `Please lengthen this text to 10 character or more (you are currently using ${inputs.assetName.length} character`
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

    inputs.installedDate = inputs.installedDate.split('-').reverse().join('/');

    put(`/asset/${assetCode}`, inputs)
      .then((res) => {
        history.push({
          pathname: '/manage_asset',
          state: {
            assetCode: res.data.assetCode,
          },
        });
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  const openDatePicker = () => {
    setIsOpenDatePicker(!isOpenDatePicker);
  }

  return (
    <div className='p-4'>
      <h5 className='mb-4' style={{ color: '#CF2338' }}> Edit asset</h5>
      <Col xs={12} sm={12} md={7}>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className='mb-3' controlId='firstName' >
            <Form.Label column sm={3}>
              Name
            </Form.Label>
            <Col>
              <Form.Control
                name='assetName'
                type='text'
                required
                onChange={handleOnChange}
                value={inputs.assetName}
              />
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
                <div className='boder_search' style={{ background: "rgb(239 241 245)" }}>
                  {inputs.categoryName}
                  <FaAngleDown className='angledown' />
                </div>
              </div>
            </Col>
          </Row>

          <Form.Group as={Row} className='mb-3' controlId='firstName'>
            <Form.Label column sm={3}>
              Specification
            </Form.Label>
            <Col>
              <Form.Control
                name='specification'
                as='textarea'
                required
                onChange={handleOnChange}
                value={inputs.specification}
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

              <Col xs={5}>
                <Form.Check
                  type='radio'
                  label='Available'
                  name='state'
                  id='available'
                  required
                  defaultChecked
                  value='AVAILABLE'
                  onChange={handleOnChange}
                  checked={inputs.state === 'AVAILABLE'}
                />
                <Form.Check
                  type='radio'
                  label='Not available'
                  name='state'
                  id='notavailable'
                  required
                  value='NOT_AVAILABLE'
                  onChange={handleOnChange}
                  checked={inputs.state === 'NOT_AVAILABLE'}
                />
                <Form.Check
                  type='radio'
                  label='Waiting for recycling'
                  name='state'
                  id='wait'
                  required
                  value='WAITING_FOR_RECYCLING'
                  onChange={handleOnChange}
                  checked={inputs.state === 'WAITING_FOR_RECYCLING'}
                />
                <Form.Check
                  type='radio'
                  label='Recycled'
                  name='state'
                  id='recycled'
                  required
                  value='RECYCLED'
                  onChange={handleOnChange}
                  checked={inputs.state === 'RECYCLED'}
                />
              </Col>
            </Form.Group>
          </fieldset>

          <Form.Group as={Row} className='float-end mb-3'>
            <Col>
              <Button variant='danger' type='submit' disabled={!preSave()}>
                Save
              </Button>
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
    </div>
  );
}
export default withRouter(EditAsset);