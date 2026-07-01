import { Box, Button, Container, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import IconButton from '@mui/material/IconButton';
import { SxProps, Theme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/user/user.selector';
import api from '../utils/api';
import ProductTableContainer from './ProductTableContainer';
import { Product, Project } from '../types/models';

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

interface ProductFormFields {
  latitude: string | number;
  longitude: string | number;
  productName: string;
  orientation: string;
  inclination: string | number;
  area: string | number;
}

const defaultFormFields: ProductFormFields = {
  latitude: '',
  longitude: '',
  productName: '',
  orientation: '',
  inclination: '',
  area: '',
};

interface LatLngState {
  lat: number | '';
  lng: number | '';
}

const ProductPage = () => {
  const params = useParams<{ projectId?: string; productId?: string }>();
  const [productData, setProductData] = useState<Product[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isProductUpdated, setIsProductUpdated] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<ProductFormFields>(defaultFormFields);
  const [formFieldModal, setFormFieldModal] = useState<string>('');
  const [buttonType, setButtonType] = useState<string>('');
  const [onClickLatlang, setOnClickLatLang] = useState<LatLngState>({ lat: '', lng: '' });
  const currentUser = useSelector(selectCurrentUser);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };
  const handleChangeModal = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormFieldModal(event.target.value);
  };
  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };
  const resetFormFieldsModal = () => {
    setFormFieldModal('');
  };
  const editHandle = () => {
    setButtonType('edit');
    handleOpen();
  };

  const deletehandle = () => {
    setButtonType('delete');
    handleOpen();
  };

  const fetchNewProjectName = async () => {
    try {
      const url = `/project?projectId=${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await api.get<Project>(url, config).then(
        (response) => {
          setReportGenerated(Boolean(response.data.isReportGeneratd));
          setProjectName(response.data.name);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const deleteModalHandle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const url = `/project/delete/${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await api.delete(url, config).then(
        (response) => {
          toast.success(response.data.message);
          setOpen(false);
          navigate('/dashboard/projects');
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const url = `/project/update/${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await api.put(url, { name: formFieldModal }, config).then(
        (response) => {
          toast.success(response.data.message);
          resetFormFieldsModal();
          fetchNewProjectName();
          setOpen(false);
        },
        (error) => {
          toast.error(error.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const url = `/product/create`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      const { latitude, longitude, productName, orientation, inclination, area } = formFields;
      await api
        .post(
          url,
          {
            latitude: +latitude,
            longitude: +longitude,
            name: productName,
            orientation,
            inclination: +inclination,
            area: +area,
            project: params?.projectId,
          },
          config
        )
        .then(
          (response) => {
            toast.success(response.data.message);
            resetFormFields();
            setFormSubmitted(!formSubmitted);
            setOnClickLatLang({ lat: '', lng: '' });
            setIsProductUpdated(true);
            getAllProductLocation();
          },
          (error) => {
            toast.error(error.message);
          }
        );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const getAllProductLocation = () => {
    try {
      const url = `/product?projectId=${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      fetchNewProjectName();
      api.get<Product[]>(url, config).then(
        (response) => {
          setProductData(response.data);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  useEffect(() => {
    getAllProductLocation();
    fetchNewProjectName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapDoubleClick = (event: LeafletMouseEvent) => {
    const { latlng } = event;
    const { lat, lng } = latlng;

    setOnClickLatLang(latlng);
    setFormFields({ ...formFields, latitude: lat, longitude: lng });
    setFormSubmitted(!formSubmitted);
  };

  const generateReportHandle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const url = `/project/generateApi/${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get(url, config).then(
        () => {
          toast.success('Report genrated Successfully');
          fetchNewProjectName();
          setReportGenerated(true);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${projectName}`}</title>
      </Helmet>
      <Container maxWidth={false} sx={{ marginLeft: 'auto', paddingLeft: '0px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex' }}>
            <Typography variant="h4" sx={{ mb: 5 }}>
              {projectName}
            </Typography>
            {reportGenerated ? (
              <></>
            ) : (
              <>
                <Tooltip title="Click To Update Project name.">
                  <IconButton sx={{ mt: 0, mb: 5, ml: 1 }} onClick={editHandle}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Click To delete the Project. Caution: Deleting project will delete all the products inside.">
                  <IconButton sx={{ mt: 0, mb: 5, ml: 1 }} onClick={deletehandle}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: `${reportGenerated ? 'orange' : '#5ac85a'} `,
                color: 'white',
                marginRight: '20px',
              }}
              disabled
            >
              {reportGenerated ? 'Inactive' : 'Active'}
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: `${reportGenerated ? 'grey' : '#48B2E3'}`, color: 'white' }}
              disabled={reportGenerated}
              onClick={generateReportHandle}
            >
              {reportGenerated ? 'Report Generated' : 'Generate Report'}
            </Button>
          </div>
        </div>
        {reportGenerated ? (
          <MapContainer
            center={[50.8282, 12.9209]}
            zoom={7}
            scrollWheelZoom={false}
            style={{
              maxHeight: '500px',
              marginLeft: '0px',
              marginRight: '0px',
              marginBottom: '50px',
              width: '100%',
              flex: '1',
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {productData?.map((product) => (
              <Marker position={[product?.latitude, product?.longitude]} key={product?.id}>
                <Popup>
                  <h3 style={{ textAlign: 'center' }}>{product.name}</h3>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div style={{ marginBottom: '50px', display: 'flex' }}>
            <MapContainer
              center={[50.8282, 12.9209]}
              zoom={7}
              scrollWheelZoom={false}
              style={{
                maxHeight: '500px',
                marginLeft: '0px',
                marginRight: '30px',
                flex: '0.7',
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {productData?.map((product) => (
                <Marker position={[product?.latitude, product?.longitude]} key={product?.id}>
                  <Popup>
                    <h3 style={{ textAlign: 'center' }}>{product.name}</h3>
                  </Popup>
                </Marker>
              ))}
              <Marker
                position={
                  [
                    onClickLatlang.lat === '' ? '' : onClickLatlang.lat,
                    onClickLatlang.lng === '' ? '' : onClickLatlang.lng,
                  ] as unknown as LatLngExpression
                }
                key={'On Double Click Marker'}
              />
              <MapEvents handleMapDoubleClick={handleMapDoubleClick} />
            </MapContainer>
            <form
              onSubmit={handleCreateProduct}
              style={{ marginRight: '0px', marginLeft: 'auto', width: '100%', flex: '0.3' }}
            >
              <Stack spacing={2}>
                <TextField
                  key={formSubmitted ? 'latitude-reset' : 'latitude'}
                  name="latitude"
                  label="Latitude"
                  type={'float'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  defaultValue={onClickLatlang.lat === '' ? '' : onClickLatlang.lat}
                  onChange={handleChange}
                />

                <TextField
                  key={formSubmitted ? 'longitude-reset' : 'longitude'}
                  name="longitude"
                  label="Longitude"
                  type={'float'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  defaultValue={onClickLatlang.lng === '' ? '' : onClickLatlang.lng}
                  onChange={handleChange}
                />

                <TextField
                  key={formSubmitted ? 'productName-reset' : 'productName'}
                  name="productName"
                  label="Product Name"
                  type={'text'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                />
                <TextField
                  key={formSubmitted ? 'orientation-reset' : 'orientation'}
                  name="orientation"
                  label="Orientation(N/E/S/W)"
                  type={'text'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                />
                <TextField
                  key={formSubmitted ? 'inclination-reset' : 'inclination'}
                  name="inclination"
                  label="Inclination"
                  type={'number'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                />
                <TextField
                  key={formSubmitted ? 'area-reset' : 'area'}
                  name="area"
                  label="Area(m²)"
                  type={'number'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                />
              </Stack>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                style={{ backgroundColor: '#48B2E3', marginTop: '20px' }}
              >
                Submit
              </LoadingButton>
            </form>
          </div>
        )}

        {buttonType === 'edit' ? (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <form onSubmit={handleRegister}>
                <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: '10px' }}>
                  Enter New Project Name
                </Typography>
                <TextField
                  name="projectName"
                  label="Project Name"
                  type={'text'}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChangeModal}
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
        ) : (
          <></>
        )}
        {buttonType === 'delete' ? (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: '10px' }}>
                Are you sure?
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: '#48B2E3', margin: '10px 30px 10px 0px' }}
                  onClick={handleClose}
                >
                  No
                </LoadingButton>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: '#48B2E3', margin: '10px 0px' }}
                  onClick={deleteModalHandle}
                >
                  Yes
                </LoadingButton>
              </div>
            </Box>
          </Modal>
        ) : (
          <></>
        )}
        <ProductTableContainer isProductUpdated={isProductUpdated} reportGenerated={reportGenerated} />
      </Container>
    </>
  );
};

export default ProductPage;

interface MapEventsProps {
  handleMapDoubleClick: (event: LeafletMouseEvent) => void;
}

const MapEvents = ({ handleMapDoubleClick }: MapEventsProps) => {
  useMapEvents({
    dblclick: handleMapDoubleClick,
  });

  return null;
};
