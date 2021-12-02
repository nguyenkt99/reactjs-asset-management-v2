import React from 'react'
import moment from "moment"
import DatePicker from "react-datepicker"
import { FaCalendarAlt } from "react-icons/fa"

export default function DatePickerCustom({startedDate, setStartedDate, showDatePicker, toggleDatePicker}) {
    return (
        <div className="datepicker">
            <DatePicker className="form-control date-picker-input"
                dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                onKeyDown={(e) => e.preventDefault()}
                selected={startedDate && new Date(startedDate)}
                onChange={(date) => setStartedDate(moment(date).format('YYYY-MM-DD'))}
                placeholderText="Started Date"
                onClickOutside={toggleDatePicker}
                onSelect={toggleDatePicker}
                onFocus={toggleDatePicker}
                open={showDatePicker}
            />
            <FaCalendarAlt className="icon-date" onClick={toggleDatePicker} />
        </div>
    )
}
