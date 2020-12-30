import { useState } from "react";
import { DateRangePicker } from "react-dates";
import { useDateState } from "./use-date-state";
import { regions } from "../pages/api/get-hotels";

import "react-dates/lib/css/_datepicker.css";

export const useSearchInput = () => {
  const {
    startDate,
    endDate,
    setFocussedInput,
    focussedInput,
    onDatesChanged,
  } = useDateState();

  const [selectedRegion, setselectedRegion] = useState<keyof typeof regions>();

  const regionSelector = (
    <select
      value={selectedRegion}
      onChange={(e) => setselectedRegion(e.currentTarget.value as any)}
    >
      <option key="unselected" disabled={true} selected={true}>
        Select a region...
      </option>
      {Object.entries(regions).map(([name, region]) => (
        <option key={name} value={name}>
          {region.title}
        </option>
      ))}
    </select>
  );

  const datePicker = (
    <DateRangePicker
      onDatesChange={onDatesChanged}
      startDate={startDate}
      startDateId="start_date_id"
      endDate={endDate}
      endDateId="end_date_id"
      focusedInput={focussedInput}
      onFocusChange={setFocussedInput}
      displayFormat="DD/MM/yyyy"
    />
  );

  return {
    startDate,
    endDate,
    datePicker,
    regionSelector,
    selectedRegion: selectedRegion && regions[selectedRegion],
  };
};
