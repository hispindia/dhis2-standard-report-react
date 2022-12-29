import React, { useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

import Cascader from "@/common/Cascader/Cascader";
import { format } from "date-fns";
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox
} from "@mui/material";
import "./Input.css";

const Input = ({
  label,
  value,
  valueType,
  valueSet,
  groupBy,
  change,
  disabled,
  mandatory,
  data,
  renderAsRadio,
  helpers,
  hidden
}) => {
  let isMobile = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }

  // let { label, value, valueType, valueSet, change, disabled, mandatory, data, renderAsRadio, helpers, hidden } =
  //   useController(props);

  valueSet = valueSet ? valueSet.filter((set) => !set.hidden) : null;

  const generateField = () => {
    if (valueSet) {
      const selected = valueSet.find((vs) => vs.value === value);
      if (renderAsRadio) {
        return (
          <RadioGroup
            row
            disabled={disabled}
            value={selected.value}
            onChange={(event, value) => {
              change(value);
            }}
          >
            {valueSet.map((vs) => {
              return <FormControlLabel value={vs.value} control={<Radio />} label={vs.label} />;
            })}
          </RadioGroup>
        );
      } else {
        return isMobile ? (
          <Select
            value={selected ? selected : ""}
            fullWidth
            size="small"
            disabled={disabled}
            onChange={(event) => {
              change(event.target.value);
            }}
          >
            {valueSet.map((vs) => {
              return <MenuItem value={vs.value}>{vs.label}</MenuItem>;
            })}
          </Select>
        ) : (
          <Autocomplete
            groupBy={groupBy}
            value={selected ? selected : null}
            disabled={disabled}
            onChange={(event, value) => {
              change(value ? value.value : "");
            }}
            isOptionEqualToValue={(option, value) => {
              return value ? option.value === value.value : false;
            }}
            size="small"
            fullWidth
            autoComplete={false}
            options={valueSet}
            renderInput={(params) => <TextField {...params} />}
          />
        );
      }
    }
    switch (valueType) {
      case "INTEGER_POSITIVE":
      case "INTEGER_NEGATIVE":
      case "INTEGER_ZERO_OR_POSITIVE":
      case "PERCENTAGE":
      case "NUMBER":
      case "INTEGER":
      case "PHONE_NUMBER":
        return (
          <TextField
            type="number"
            size="small"
            fullWidth
            disabled={disabled}
            value={value}
            onChange={(event) => {
              change(event.target.value);
            }}
          />
        );
      case "TEXT":
      case "EMAIL":
        return (
          <TextField
            size="small"
            fullWidth
            disabled={disabled}
            value={value}
            onChange={(event) => {
              change(event.target.value);
            }}
          />
        );
      case "LONG_TEXT":
        return (
          <TextField
            size="small"
            multiline
            fullWidth
            disabled={disabled}
            value={value}
            onChange={(event) => {
              change(event.target.value);
            }}
          />
        );
      case "AGE":
      case "DATE":
        return (() => {
          const [currentValue, setCurrentValue] = useState(value);

          return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disabled={disabled}
                mask={"____-__-__"}
                inputFormat="yyyy-MM-dd"
                views={["year", "month", "day"]}
                value={currentValue}
                onChange={(value) => {
                  setCurrentValue(value);
                  // change(value ? format(value, "yyyy-MM-dd") : "");
                }}
                onAccept={(value) => {
                  change(value ? format(value, "yyyy-MM-dd") : "");
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth inputProps={{ ...params.inputProps, readOnly: true }} />
                )}
              />
            </LocalizationProvider>
          );
        })();
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              disabled={disabled}
              mask={"____-__-__"}
              inputFormat="yyyy-MM-dd"
              views={["year", "month", "day"]}
              value={value}
              onChange={(value) => {
                console.log(value);
                change(value ? format(value, "yyyy-MM-dd") : "");
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth inputProps={{ ...params.inputProps, readOnly: true }} />
              )}
            />
          </LocalizationProvider>
        );
      case "BOOLEAN":
        return (
          <RadioGroup
            row
            disabled={disabled}
            value={value}
            onChange={(event, value) => {
              change(value);
            }}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        );
      case "TRUE_ONLY":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value === "true"}
                onChange={(event) => {
                  const checked = event.target.checked;
                  change(checked ? "true" : "");
                }}
              />
            }
            label={label}
            disabled={disabled}
          />
        );
      case "CASCADER":
        return <Cascader data={data} change={change} disabled={disabled} />;
      case "DATETIME":
      case "TIME":
        return <span>UNSUPPORTED VALUE TYPE</span>;
      default:
        return <span>UNSUPPORTED VALUE TYPE</span>;
    }
  };
  return !hidden ? (
    <>
      {label && valueType !== "TRUE_ONLY" && (
        <Typography variant="inputFieldLabel">
          {label}
          {mandatory && <Typography variant="mandatoryStar">&nbsp;&lowast;</Typography>}
        </Typography>
      )}
      {generateField()}
      {helpers &&
        helpers.map((h) => {
          return (
            <div>
              <Typography variant={h.type}>{h.value}</Typography>
            </div>
          );
        })}
    </>
  ) : null;
};

export default Input;
