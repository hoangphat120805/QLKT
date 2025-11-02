"use client";

import { useState } from "react";
import { Input, Checkbox, Select } from "antd";

interface EditableCellProps {
  value: any;
  type: "text" | "checkbox" | "number" | "select";
  onSave: (newValue: any) => void;
  editable?: boolean;
  options?: { label: string; value: string }[];
}

export function EditableCell({ value, type, onSave, editable = true, options = [] }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (!editable) {
    if (type === "checkbox") {
      return <Checkbox checked={!!value} disabled />;
    }
    if (type === "select") {
      const option = options.find(opt => opt.value === value);
      return <span style={{ color: "#666" }}>{option?.label || value || "-"}</span>;
    }
    return <span style={{ color: "#666" }}>{value || "-"}</span>;
  }

  if (type === "checkbox") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Checkbox
          checked={!!currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.checked);
            onSave(e.target.checked);
          }}
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <Select
        value={currentValue}
        onChange={(val) => {
          setCurrentValue(val);
          onSave(val);
        }}
        style={{ width: "100%" }}
        size="small"
        options={options}
      />
    );
  }

  if (isEditing) {
    return (
      <Input
        type={type === "number" ? "number" : "text"}
        value={currentValue || ""}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        size="small"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        cursor: "pointer",
        padding: "4px 8px",
        minHeight: "32px",
        display: "flex",
        alignItems: "center",
        borderRadius: "4px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {currentValue || <span style={{ color: "#bfbfbf", fontStyle: "italic" }}>Nhấn để sửa</span>}
    </div>
  );
}
