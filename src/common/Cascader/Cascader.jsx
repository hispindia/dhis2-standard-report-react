import React, { useState, useEffect } from "react";
import Input from "@/common/Input/Input";
import "./Cascader.css";
const Cascader = ({ data, change, disabled }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const { initValues } = data;
    initValues.forEach((value, index) => {
      const currentValueSet = index === 0 ? data.data : selected[index - 1] ? selected[index - 1].children : [];
      const found = currentValueSet.find((set) => set.value === value);
      if (found) {
        selected[index] = found;
      } else {
        selected[index] = "";
      }
    });
    setSelected([...selected]);
  }, []);

  return (
    <div className="cascader-container">
      {data.labels.map((label, index) => {
        const currentValueSet = index === 0 ? data.data : selected[index - 1] ? selected[index - 1].children : [];
        return (
          <div>
            <Input
              value={selected[index] ? selected[index].value : ""}
              label={label}
              disabled={disabled}
              valueSet={currentValueSet}
              change={(value) => {
                const found = currentValueSet.find((set) => set.value === value);
                selected[index] = found;
                for (let i = data.labels.length - 1; i > index; i--) {
                  selected[i] = null;
                }
                setSelected([...selected]);
                change([...selected]);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
export default Cascader;
