import {useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    MenuItem,
    TextField
} from "@mui/material";

import { toast } from 'react-toastify';
import TagIcon from '@mui/icons-material/Tag';
import { updateFileTags } from "../../actions/files";


export default function TagButton(props){
    const { row, stateChangeFlag, setStateChangeFlag } = props;
    const [open, setOpen] = useState(false);
    const [tags, setTags] = useState(row.customMetadata.tags);
    const cleanedName = row.name.split(".").slice(0, -1).join(".");

    const handleOpen = async () => {
        setOpen(true);
    }

    const handleConfirm = async () => {
        const tagsArray = tags.split(",");
        if (tagsArray.length > 10) {
            toast.error('Too many tags! Maximum 10 tags are allowed!');
            return;
        }
        const tagsArrayWithFileId = [];
        for (let i = 0; i<tagsArray.length; i+=1){
            tagsArrayWithFileId.push({"file_id": row.md5Hash + row.name, "file_tag": tagsArray[i].trim()});
        }
        try {
            await updateFileTags(encodeURIComponent(row.md5Hash) + row.name, tagsArrayWithFileId);
            toast.success(`File tags for ${cleanedName} is updated successfully!`);
            setStateChangeFlag(stateChangeFlag + 1);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <MenuItem>
                <TagIcon onClick={handleOpen} style={{ cursor: 'pointer', color:"#637381"}} />
            </MenuItem>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Tags Management for {cleanedName}</DialogTitle>
                <List sx={{ pt: 0 }}>
                    <DialogContent>
                        <b>Input format: comma-separated tag(s)!</b><br/>
                        <i>Note: Maximum 10 tags are allowed for a file.</i>
                        <br/><br/>
                        List of tag(s) associated with this file:
                    </DialogContent>
                    <ListItem disableGutters>
                        <ListItemButton
                            autoFocus
                        >
                            <TextField
                                id="file-tags"
                                variant="outlined"
                                style={{width:"80%"}}
                                placeholder="no tags yet..."
                                multiline
                                value={tags}
                                onChange={(event) => {
                                    setTags(event.target.value);
                                }}
                            />
                            <Button
                                variant="contained"
                                style={{margin:"10px",backgroundColor: "#48B2E3"}}
                                onClick={handleConfirm}
                            >
                                Confirm
                            </Button>
                        </ListItemButton>
                    </ListItem>
                </List>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setOpen(false)}
                            style={{margin:"10px",color: "#48B2E3"}}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
