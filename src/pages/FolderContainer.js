import React from "react";
import { useNavigate } from "react-router-dom";
import folderIcon from "./foldericon.png";
import grayIcon from "./grayFolder.png";
import "./FolderContainer.css";

const FolderContainer = ({ folderName, folderId, isReportGeneratd }) => {
  const navigate = useNavigate();
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Perform the same action as the click handler
      //   console.log("Element clicked!");
    }
  };
  const handleClick = (event) => {
    event.preventDefault();
    navigate(`/dashboard/projects/${folderId}`, { state: folderName });
  };

  return (
    <div className="folder-card" onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
      <div className="image-container">
        <img src={isReportGeneratd ? grayIcon : folderIcon} alt="Folder Icon" />
      </div>
      <div className="folder-name" style={{ color: isReportGeneratd ? "gray" : "black" }}>
        {folderName}
      </div>
    </div>
  );
};

export default FolderContainer;
