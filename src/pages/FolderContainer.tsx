import { useNavigate } from 'react-router-dom';
import folderIcon from './foldericon.png';
import grayIcon from './grayFolder.png';
import './FolderContainer.css';

interface FolderContainerProps {
  folderName: string;
  folderId: string;
  isReportGeneratd?: boolean;
}

const FolderContainer = ({ folderName, folderId, isReportGeneratd }: FolderContainerProps) => {
  const navigate = useNavigate();
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      navigate(`/dashboard/projects/${folderId}`, { state: folderName });
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    navigate(`/dashboard/projects/${folderId}`, { state: folderName });
  };

  return (
    <div className="folder-card" onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
      <div className="image-container">
        <img src={isReportGeneratd ? grayIcon : folderIcon} alt="Folder Icon" />
      </div>
      <div className="folder-name" style={{ color: isReportGeneratd ? 'gray' : 'black' }}>
        {folderName}
      </div>
    </div>
  );
};

export default FolderContainer;
