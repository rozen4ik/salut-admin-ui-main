import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import MainCard from '../../components/MainCard';
import CTable from '../../components/CTable';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import controller from '../../api/controller';
import { useSearchParams } from 'react-router-dom';

const SelectGroup = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const userData = JSON.parse(localStorage.getItem('user'));
    const instrId = userData?.employee.id_emp;
    const [groups, setGroups] = useState([]);
    const id_sp = searchParams.get('id_sp');
    const [open, setOpen] = React.useState(false);

    const columns = [
        { label: 'id', field: 'tgt_id' },
        { label: 'Название', field: 'tgt_name' },
        { label: 'Комментарий', field: 'tgt_comment' }
    ];

    console.log(id_sp);

    // const navigate = useNavigate();

    const onRowClick = (row) => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const loadData = async () => {
        let response;
        if (instrId) {
            response = await controller.getGroupTypes();
        }
        setGroups(response.tgrouptypes);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <MainCard title="Все группы">
            <Box>
                <CTable columns={columns} content={groups} onRowClick={onRowClick} keyProp={'tgt_id'} />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Subscribe</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To subscribe to this website, please enter your email address here. We will send updates occasionally.
                        </DialogContentText>
                        <TextField margin="dense" id="name" label="Email Address" type="email" fullWidth variant="standard" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleClose}>Subscribe</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainCard>
    );
};

export default SelectGroup;
