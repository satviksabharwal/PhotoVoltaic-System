import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, MenuItem, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import LockIcon from '@mui/icons-material/Lock';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { updateFileGeneralAccess } from '../../actions/files';

export default function AccessControlChangeButton(props) {
  const { fileId, fileStatus, fileName, isOwnFile } = props;
  const [open, setOpen] = useState(false);
  const [fileStatusState, setFileStatusState] = useState(fileStatus);
  const cleanedFileName = fileName.split('.').slice(0, -1).join('.');

  useEffect(() => {
    setFileStatusState(fileStatus);
  }, [fileStatus]);

  const handleChangeAccessControl = async (changeValue) => {
    setFileStatusState(changeValue);
    await updateFileGeneralAccess(fileId, changeValue);
    handleClose();
    const publicOrRestricted = changeValue ? 'public' : 'restricted';
    toast.success(`${cleanedFileName} is set to ${publicOrRestricted}!`);
  };

  const openModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!isOwnFile) {
    return (
      <>
        <MenuItem>
          <Stack
            direction="row"
            spacing={2}
            onClick={openModal}
            style={{ cursor: 'pointer', margin: '5px 0px', alignItems: 'start' }}
          >
            <Button
              variant="outlined"
              startIcon={<FolderSharedIcon />}
              color="secondary"
              style={{ alignItems: 'start' }}
              disabled
            >
              Public/Shared file
            </Button>
          </Stack>
        </MenuItem>
      </>
    );
  }

  return (
    <>
      <MenuItem>
        {fileStatusState ? (
          <Stack
            direction="row"
            spacing={2}
            onClick={openModal}
            style={{ cursor: 'pointer', margin: '5px 0px', alignItems: 'start' }}
          >
            <Button variant="outlined" startIcon={<PresentToAllIcon />} color="info">
              Owned, Public
            </Button>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={2}
            onClick={openModal}
            style={{ cursor: 'pointer', margin: '5px 0px', alignItems: 'start' }}
          >
            <Button variant="outlined" startIcon={<LockIcon />} color="error">
              Owned, Restricted
            </Button>
          </Stack>
        )}
      </MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>General Access Control</DialogTitle>

        <List sx={{ pt: 0 }}>
          <DialogContent>
            Are you sure that you want to make <i>{cleanedFileName}</i>{' '}
            <b>{fileStatusState === true ? 'restricted' : 'public'}</b>?
          </DialogContent>
        </List>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} style={{ margin: '10px', color: '#637381' }}>
            Cancel
          </Button>
          {fileStatusState === true ? (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleChangeAccessControl(false)}
              style={{ margin: '10px' }}
            >
              Change to Restricted
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="info"
              onClick={() => handleChangeAccessControl(true)}
              style={{ margin: '10px' }}
            >
              Change to Public
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
