import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import { BsSearch } from 'react-icons/bs'

export default function SearchInput({ value, setValue }) {
    return (
        <InputGroup className="mb-3">
            <FormControl
                style={{ fontSize: "1.4rem" }}
                placeholder="Search"
                onChange={(e) => setValue(e.target.value)}
            />
            <InputGroup.Text style={{ fontSize: "1.4rem" }}><BsSearch /></InputGroup.Text>
        </InputGroup>
    )
}
