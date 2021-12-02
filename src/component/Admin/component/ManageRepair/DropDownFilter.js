import React from 'react'
import { Dropdown, Button, FormCheck } from 'react-bootstrap'
import { HiFilter } from 'react-icons/hi';


export default function DropDownFilter({ states, stateChecked, handleStateClick }) {
    return <>
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
                {states.map(state =>
                    <div className='dropdown-item checkbox px-3' onClick={() => handleStateClick(state)}>
                        <FormCheck label={state} checked={stateChecked.includes(state) ? 'checked' : ''} />
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    </>
}
