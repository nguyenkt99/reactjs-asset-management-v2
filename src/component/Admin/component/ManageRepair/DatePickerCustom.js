import React from 'react'
import moment from "moment"
import DatePicker from "react-datepicker"
import { FaCalendarAlt } from "react-icons/fa"

export default function DatePickerCustom({title, date, setDate, showDatePicker, toggleDatePicker}) {
    return (
        <div className="datepicker">
            <DatePicker className="form-control date-picker-input"
                dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown scrollableYearDropdown yearDropdownItemNumber={50}
                onKeyDown={(e) => e.preventDefault()}
                selected={date && new Date(date)}
                onChange={(date) => setDate(moment(date).format('YYYY-MM-DD'))}
                placeholderText={title}
                onClickOutside={toggleDatePicker}
                onSelect={toggleDatePicker}
                onFocus={toggleDatePicker}
                open={showDatePicker}
            />
            <FaCalendarAlt className="icon-date" onClick={toggleDatePicker} />
        </div>
    )
}
