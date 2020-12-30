import moment, { Moment } from "moment";
import { useCallback, useState } from "react";
import { FocusedInputShape } from "react-dates";

export const useDateState = () => {
  const [startDate, setStartDate] = useState<Moment | null>(moment());
  const [endDate, setEndDate] = useState<Moment | null>(
    moment().add(10, "days")
  );
  const [focussedInput, setFocussedInput] = useState<FocusedInputShape | null>(
    null
  );

  const onDatesChanged = useCallback<
    (a: { startDate: Moment | null; endDate: Moment | null }) => void
  >(
    ({ startDate, endDate }) => {
      setStartDate(startDate);
      setEndDate(endDate);
    },
    [setStartDate, setEndDate]
  );

  return {
    startDate,
    endDate,
    onDatesChanged,
    focussedInput,
    setFocussedInput,
  };
};
