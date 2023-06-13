import { useDispatch } from "react-redux";
import { useState, useContext } from "react";
import { deleteObject, getStorage, ref } from "firebase/storage";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, MenuItem } from "@mui/material";
import { deleteDatasetAction } from "../../store/dataset/dataset.action";
import { deleteFileMetadata } from "../../actions/files";
import {CurrentUserMetadataContext} from "../../App";
import {retrieveUserMetadata} from "../../actions/users";

export default function DeleteButton(props) {
    const dispatch = useDispatch();
    const {currentUserMetadata, setUserMetadata} = useContext(CurrentUserMetadataContext);
    const { row } = props;
    const [open, setOpen] = useState(false);
    const handleDelete = async () => {
        const deleteFile = row?.fullPath;
        const storage = getStorage();
        const datasetRef = ref(storage, deleteFile);
        await dispatch(deleteDatasetAction(datasetRef, deleteObject));
        await deleteFileMetadata(encodeURIComponent(row?.md5Hash) + row?.name);
        const res = await retrieveUserMetadata(currentUserMetadata.userId);
        setUserMetadata(res);
        handleClose();
    };

    const openDeleteModal = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <MenuItem>
                <DeleteIcon onClick={openDeleteModal} style={{ cursor: 'pointer', color:"#637381"}} />
            </MenuItem>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete file</DialogTitle>

                <List sx={{ pt: 0 }}>
                    <DialogContent>
                        Are you sure that you want to delete this file? <br/> You will not be able to recover it!
                    </DialogContent>

                </List>
                <DialogActions>
                    <Button variant="outlined" onClick={handleClose} style={{margin:"10px",color: "#48B2E3"}}>Cancel</Button>
                    <Button onClick={handleDelete} style={{margin:"10px",backgroundColor: "#48B2E3",color:"white"}}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}