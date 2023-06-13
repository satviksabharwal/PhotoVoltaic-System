import {useContext, useEffect, useState} from "react";
import {
    Autocomplete,
    Button,
    Box,
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

import { DataGrid } from '@mui/x-data-grid';
import ShareIcon from "@mui/icons-material/Share";
import { toast } from "react-toastify";
import {
    retrieveFileSharedToEmails,
    updateFileSharedToEmails,
    deleteFileSharedToEmail
} from "../../actions/files";
import {CurrentUserMetadataContext} from "../../App";

export default function ShareButton(props){
    const [emails, setEmails] = useState([]);
    const [emailList, setEmailList] = useState([]);
    const { row } = props;
    const {currentUserMetadata} = useContext(CurrentUserMetadataContext);
    console.log(currentUserMetadata);
    const [fileStatusState, setFileStatusState] = useState(row?.customMetadata?.is_file_public);
    const [open, setOpen] = useState(false);
    const clearedName = row.name.split(".").slice(0, -1).join(".");

    useEffect(() => {
        setFileStatusState(row?.customMetadata?.is_file_public);
    }, [row?.customMetadata?.is_file_public]);

    const handleOpen = async () => {
        setOpen(true);
        const response = await retrieveFileSharedToEmails(encodeURIComponent(row.md5Hash) + row.name);
        setEmailList(response?.response ?? []);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const isValidEmail = (email) => {
        // use regex to check whether the email given is a valid email syntactically
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const handleConfirm = async () => {
        // filter email address that are already there
        const emailsArray = emails.map((ele) => { return { "user_email": ele } })
            .filter((ele) => !emailList.find(e => ele.user_email === e.user_email)
                && isValidEmail(ele.user_email));

        const emailsArrayWithFileId = emailsArray.map((ele) => {
            return {
                "file_id": row.md5Hash + row.name,
                "user_email": ele.user_email.trim().toLowerCase()
            }
        });
        if (emailsArrayWithFileId.length > 0) {
            try {
                await updateFileSharedToEmails(encodeURIComponent(row.md5Hash) + row.name, currentUserMetadata.userEmail, emailsArrayWithFileId);
                setEmailList((prevState) => [...prevState, ...emailsArray]);
                setEmails([]);
                toast.success(`Successfully updated the list of email addresses the file is shared to!`);
            } catch (e) {
                console.error(e);
            }
        } else {
            toast.error("Please add least one new email address before confirm!");
        }
    }

    const updateEmailListAfterDelete = (email) => {
        setEmailList((prevState) => prevState.filter(ele => ele?.user_email
            !== email));
    }

    const columns = [
        {
            field: 'user_email',
            headerName: 'Email',
            width: 350,
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 100,
            renderCell: (params) => {
                return (
                    <>
                        <Button
                            variant="text"
                            onClick={ async (e) => {
                                e.stopPropagation();
                                const response = await deleteFileSharedToEmail(encodeURIComponent(row?.md5Hash) + row?.name,
                                    params?.row?.user_email);
                                toast.success(response?.message);
                                updateEmailListAfterDelete(params?.row?.user_email);
                            }}
                        >
                            Revoke access
                        </Button>
                    </>
                )
            }
        }
    ];

    const customLocaleText = {
        noRowsLabel: 'The file has not been shared with any email address...'
    };

    return (
        <>
            <MenuItem>
                <ShareIcon onClick={handleOpen} style={{ cursor: 'pointer', color:"#637381"}} />
            </MenuItem>
            <Dialog open={open} onClose={handleClose}>
            { fileStatusState === true ?
                (<>
                    <DialogContent>
                        <b>{clearedName}</b> is a public file. <br/><br/> It is searchable for everyone!
                    </DialogContent>
                </>)
                : (<>
                    <DialogTitle>Share <b>{clearedName}</b></DialogTitle>
                    <List sx={{ pt: 0 }}>
                        <DialogContent>
                            Add people with whom you would like to share this file. <br/>
                        </DialogContent>
                        <ListItem disableGutters>
                            <ListItemButton
                                autoFocus
                            >
                                <Autocomplete
                                    id="email-addresses"
                                    variant="outlined"
                                    style={{width:"100%"}}
                                    multiple
                                    freeSolo
                                    fullWidth
                                    value={emails}
                                    options={[]}
                                    onChange={(event, value) => setEmails(value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Press Enter to add an email"
                                            multiline
                                        />
                                    )}
                                />

                                <Button
                                    variant="contained"
                                    style={{margin:"10px",backgroundColor: "#48B2E3"}}
                                    onClick={handleConfirm}
                                >
                                    Add
                                </Button>
                                {/** <ListItemText primary="Add account" /> */}
                            </ListItemButton>
                        </ListItem>
                        <DialogContent>
                            <b>List of email address(es) with whom you have shared this file</b>
                        </DialogContent>
                        <Box sx={{ height: '30vh', width: '100%' }}>
                            <DataGrid
                                columns={columns}
                                rows={emailList}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                checkboxSelection={false}
                                disableSelectionOnClick
                                getRowId={(r) => r?.user_email}
                                headerHeight={0}
                                localeText={customLocaleText}
                            />
                        </Box>
                    </List>
                </>)
            }
                <DialogActions>
                    <Button variant="outlined" onClick={handleClose} style={{margin:"10px",color: "#48B2E3"}}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}