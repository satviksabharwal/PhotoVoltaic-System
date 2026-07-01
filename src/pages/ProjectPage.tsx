import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// @mui
import { Box, Button, Container, Modal, TextField, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
// components
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/user/user.selector';
import api from '../utils/api';
import FolderContainer from './FolderContainer';
import { Project } from '../types/models';

// ----------------------------------------------------------------------

const style: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #48B2E3',
  borderRadius: '2%',
  boxShadow: 24,
  p: 4,
};

export default function ProjectPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [formField, setFormField] = useState<string>('');
  const [projectData, setProjectData] = useState<Project[]>([]);
  const currentUser = useSelector(selectCurrentUser);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormField(event.target.value);
  };
  const resetFormFields = () => {
    setFormField('');
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const url = '/project/create';
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await api.post(url, { name: formField }, config).then(
        (response) => {
          toast.success(response.data.message);
          resetFormFields();
          setOpen(false);
          fetchApiCall();
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const fetchApiCall = () => {
    try {
      const url = '/project';
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get<Project[]>(url, config).then(
        (response) => {
          setProjectData(response.data);
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  useEffect(() => {
    fetchApiCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title> Projects </title>
      </Helmet>

      <Container maxWidth={false}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Projects
        </Typography>
        <Button variant="contained" style={{ backgroundColor: '#48B2E3' }} size="large" onClick={handleOpen}>
          Create New Project
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={handleRegister}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: '10px' }}>
                Enter Project Name
              </Typography>
              <TextField
                name="projectName"
                label="Project Name"
                type={'text'}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                style={{ backgroundColor: '#48B2E3', margin: '10px 0' }}
              >
                Submit
              </LoadingButton>
            </form>
          </Box>
        </Modal>
        <Box
          sx={{
            minWidth: 150,
            maxHeight: 'calc(100vh - 50px)',
            marginTop: '50px',
            display: 'flex',
            columnGap: '50px',
            flexWrap: 'wrap',
          }}
        >
          {projectData?.map((project) =>
            project?.name && project?.id ? (
              <FolderContainer
                folderName={project?.name}
                folderId={project?.id}
                key={project?.id}
                isReportGeneratd={project?.isReportGeneratd}
              />
            ) : (
              <></>
            )
          )}
        </Box>
      </Container>
    </>
  );
}
