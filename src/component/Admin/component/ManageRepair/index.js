import React, { useState, useEffect, useRef } from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import { BsFillCaretDownFill, BsSearch } from 'react-icons/bs'
import { get, del, put } from '../../../../httpHelper'
import DropDownFilter from './DropDownFilter'
import DatePickerCustom from './DatePickerCustom'
import SearchInput from './SearchInput'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import ModalDetailedRepair from './ModalDetailedRepair'
import ModalConfirm from './ModalConfirmDelete'
import ModalFinishRepair from './ModalFinishRepair'

export default function ManageRepair() {
    const repairdIdRef = useRef(null)
    const [stateChecked, setStateChecked] = useState(['ALL'])
    const [repairs, setRepairs] = useState([])
    const [data, setData] = useState([])
    const [selectedRepair, setSelectedRepair] = useState({})
    const [assetCodeASC, setAssetCodeASC] = useState(true)
    const [assetNameASC, setAssetNameASC] = useState(false)
    const [categoryASC, setCategoryASC] = useState(false)
    const [stateASC, setStateASC] = useState(false)
    const [startedDate, setStartedDate] = useState(null)
    const [finishedDate, setFinishedDate] = useState(null)
    const [showDatePickerStarted, setShowDatePickerStarted] = useState(false)
    const [showDatePickerFinished, setShowDatePickerFinished] = useState(false)
    const [keySearch, setKeySearch] = useState('')
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [showModalDelete, setShowModalDelete] = useState(false)
    const [showModalFinish, setShowModalFinish] = useState(false)
    const [note, setNote] = useState('')

    useEffect(() => {
        fetchRepairs()
    }, [])

    useEffect(() => {
        let result = [...data]
        var statedDatePicked = startedDate ? moment(startedDate).format('DD/MM/YYYY') : null
        var finishedDatePicked = finishedDate ? moment(finishedDate).format('DD/MM/YYYY') : null
        result = filterSort(data.filter(d => (stateChecked.includes(d.state) || stateChecked.includes('ALL')) &&
            (d.startedDate === statedDatePicked ||   statedDatePicked === null)
            && (d.finishedDate === finishedDatePicked ||   finishedDatePicked === null)), keySearch)
        setRepairs(result)
    }, [stateChecked, startedDate, finishedDate, keySearch])

    const fetchRepairs = () => {
        get('/repair').then(res => {
            setRepairs(res.data)
            setData(res.data)
        }).catch(error => console.log(error))
    }

    const handleDeleteRepair = () => {
        del(`/repair/${repairdIdRef.current}`)
            .then(res => {
                setRepairs([...repairs].filter(r => r.id !== repairdIdRef.current))
                setData([...data].filter(d => d.id !== repairdIdRef.current))
                repairdIdRef.current = null
                handleCloseModalDelete()
            })
            .catch(error => console.log(error))
    }

    const handleFinishRepair = () => {
        put(`/repair/${repairdIdRef.current}`, note)
            .then(res => {
                let newRepairs = [...repairs]
                let newData = [...data]
                const idxInRepairs = repairs.findIndex(r => r.id === repairdIdRef.current)
                const idxInData = data.findIndex(d => d.id === repairdIdRef.current)
                newRepairs[idxInRepairs] = res.data
                newData[idxInData] = res.data
                setRepairs(newRepairs)
                setData(newData)
                handleCloseModalFinish()
            })
            .catch(error => console.log(error))
    }

    const filterSort = (data, keySearch) => {
        return data.filter((d) => (d.id.toString() === keySearch
            || d.assetCode.toLowerCase().includes(keySearch.toLowerCase())
            || d.assetName.toLowerCase().includes(keySearch.toLowerCase())
            || d.categoryName.toLowerCase().includes(keySearch.toLowerCase())
            || d.createdBy.toLowerCase().includes(keySearch.toLowerCase())
        ));
    };


    const handleStateClick = (state) => {
        if (state === 'ALL') setStateChecked([state])
        else {
            stateChecked.includes(state) ?
                setStateChecked([...stateChecked.filter(item => item !== state)])
                :
                setStateChecked([...stateChecked.filter(item => item !== 'ALL'), state])
        }
    }

    const handleSort = (field) => {
        let reverse = -1;
        let list = [];
        if (field === SORT_BY.AssetCode) {
            reverse = assetCodeASC ? -1 : 1;
            setAssetCodeASC(!assetCodeASC);
            list = repairs.slice().sort((a, b) => a.assetCode > b.assetCode ? 1 * reverse : b.assetCode > a.assetCode ? -1 * reverse : 0);
        } else if (field === SORT_BY.AssetName) {
            reverse = assetNameASC ? -1 : 1;
            setAssetNameASC(!assetNameASC);
            list = repairs.slice().sort((a, b) => a.assetName > b.assetName ? 1 * reverse : b.assetName > a.assetName ? -1 * reverse : 0);
        } else if (field === SORT_BY.Category) {
            reverse = categoryASC ? -1 : 1;
            setCategoryASC(!categoryASC);
            list = repairs.slice().sort((a, b) => a.categoryName > b.categoryName ? 1 * reverse : b.categoryName > a.categoryName ? -1 * reverse : 0);
        } else if (field === SORT_BY.State) {
            reverse = stateASC ? -1 : 1;
            setStateASC(!stateASC);
            list = repairs.slice().sort((a, b) => a.state > b.state ? 1 * reverse : b.state > a.state ? -1 * reverse : 0);
        }
        setRepairs(list);
    };

    const handleRowClick = (id) => {
        setSelectedRepair(repairs.find(r => r.id === id))
        setShowModalDetail(true)
    }

    const handleCloseModalDetail = () => {
        setShowModalDetail(false)
    }

    const toggleDatePickerStarted = () => {
        setShowDatePickerStarted(!showDatePickerStarted)
    }

    const toggleDatePickerFinished = () => {
        setShowDatePickerFinished(!showDatePickerFinished)

    }

    const onClickFinishRepair = (id) => {
        repairdIdRef.current = id
        const repair = data.find(d => d.id === id)
        setNote(repair.note)
        setShowModalFinish(true)
    }

    const onClickDeleteRepair = (id) => {
        repairdIdRef.current = id
        setShowModalDelete(true)
    }

    const handleCloseModalDelete = () => {
        setShowModalDelete(false)
    }

    const handleCloseModalFinish = () => {
        setShowModalFinish(false)
    }

    return <>
        <h3 className="content-title">Repair List</h3>
        <Row>
            <Col xs={3}>
                <DropDownFilter states={states} stateChecked={stateChecked} handleStateClick={handleStateClick} />
            </Col>
            <Col xs={3}>
                <DatePickerCustom
                    title="Started Date"
                    date={startedDate}
                    setDate={setStartedDate}
                    showDatePicker={showDatePickerStarted}
                    toggleDatePicker={toggleDatePickerStarted}
                />
            </Col>
            <Col xs={3}>
                <DatePickerCustom
                    title="Finished Date"
                    date={finishedDate}
                    setDate={setFinishedDate}
                    showDatePicker={showDatePickerFinished}
                    toggleDatePicker={toggleDatePickerFinished}
                />
            </Col>
            <Col xs={3}>
                <SearchInput value={keySearch} setValue={setKeySearch} />
            </Col>
        </Row>
        <Row>
            <Table className="content-table" responsive>
                <thead>
                    <tr>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.AssetCode)}>
                            No.
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.AssetCode)}>
                            Asset Code
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.AssetName)}>
                            Asset Name
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.Category)}>
                            Category
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.StartedDate)}>
                            Started Date
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.FinishedDate)}>
                            Finished Date
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.CreatedBy)}>
                            Created By
                            <BsFillCaretDownFill />
                        </th>
                        <th className='table-thead' onClick={() => handleSort(SORT_BY.State)}>
                            State
                            <BsFillCaretDownFill />
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {repairs?.map(r => (
                        <tr key={r.id}>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.id}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.assetCode}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.assetName}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.categoryName}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.startedDate}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.finishedDate}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {r.createdBy}
                            </td>
                            <td onClick={() => handleRowClick(r.id)}>
                                {StateToLowerCase[r.state]}
                            </td>
                            <td>
                                {r.state === 'REPAIRING' ?
                                    <>
                                        <FontAwesomeIcon style={{ cursor: "pointer", marginRight: "8px" }} color="red" size="lg" icon={faCheck} onClick={() => onClickFinishRepair(r.id)} />
                                        <FontAwesomeIcon style={{ cursor: "pointer" }} size="lg" icon={faTimes} onClick={() => onClickDeleteRepair(r.id)} />
                                    </>
                                    :
                                    <>
                                        <FontAwesomeIcon style={{ marginRight: "8px" }} color="#ccc" size="lg" icon={faCheck} />
                                        <FontAwesomeIcon color="#ccc" size="lg" icon={faTimes} />
                                    </>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Row>

        {/* Modal detailed repair infor */}
        <ModalDetailedRepair
            repair={selectedRepair}
            show={showModalDetail}
            handleClose={handleCloseModalDetail}
        />

        {/* Modal confirm delete repair */}
        <ModalConfirm
            title="Do you want to delete this repair?"
            show={showModalDelete}
            handleClose={handleCloseModalDelete}
            handleDelete={handleDeleteRepair}
        />

        {/* Modal finished repair */}
        <ModalFinishRepair
            note={note}
            setNote={setNote}
            description="Do you want to finish this repair?"
            show={showModalFinish}
            handleClose={handleCloseModalFinish}
            handleFinish={handleFinishRepair}
        />
    </>
}

const states = ['ALL', 'REPAIRING', 'REPAIRED']
const StateToLowerCase = {
    ALL: 'All',
    REPAIRING: 'Repairing',
    FINISHED: 'Finished'
}
const SORT_BY = {
    AssetCode: 'assetCode',
    AssetName: 'assetName',
    Category: 'category',
    State: 'state',
    StartedDate: 'startedDate',
    FinishedDate: 'finishedDate',
    CreatedBy: 'createdBy'
};