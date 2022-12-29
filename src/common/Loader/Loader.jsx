import React from "react";
import { CircularProgress, Typography } from "@mui/material";
import "./Loader.css";

const Loader = (props) => {
  const { children } = props;
  return (
    <div className="loading-container">
      <div>
        <CircularProgress size={80} thickness={2} sx={{ marginBottom: 2 }} />
        <Typography>{children}</Typography>
      </div>
    </div>
  );
};

export default Loader;
