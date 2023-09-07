import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import controller from '../../../api/controller';
import MainCard from '../../../components/MainCard';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import CTable from '../../../components/CTable';
import { useSearchParams } from 'react-router-dom';
import * as React from 'react';

const SelectGroup = () => {
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const id_sp = searchParams.get('id_sp');
    const instrId = params.id_instr;
    const [groups, setGroups] = useState([]);
    const [id_group, setIdGroup] = useState([]);
    const [open, setOpen] = React.useState(false);

    const columns = [
        { label: 'Название', field: 'tg_name' },
        { label: 'Дата обновления', field: 'tg_date_change' },
        { label: 'Комментарий', field: 'tg_comment' }
    ];

    const navigate = useNavigate();

    const loadMoveClientGroup = async (id_sp, id_group) => {
        await controller.moveClientInGroup(id_sp, id_group);
    };

    const moveClient = () => {
        loadMoveClientGroup(id_sp, id_group);
        setOpen(false);
        navigate('/group-clients/' + id_group);
    };

    const handleOpen = (row) => {
        setOpen(true);
        console.log(row.tg_id);
        setIdGroup(row.tg_id);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const loadData = async () => {
        let response;
        if (instrId) {
            response = await controller.getGroupsByInstrId(instrId);
        }
        setGroups(response.tgroups);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <MainCard title="Все группы">
            <Box>
                <CTable columns={columns} content={groups} onRowClick={handleOpen} keyProp={'tg_id'} />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Подтверждение переноса</DialogTitle>
                    <DialogContent>
                        {/*<DialogContentText>Для подтверждения переноса клиента в спортивную группу введите свой логин.</DialogContentText>*/}
                        {/*<TextField margin="dense" id="name" label="Идентификатор" type="email" fullWidth variant="standard" />*/}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Закрыть</Button>
                        <Button onClick={moveClient}>Перенести</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainCard>
    );
};

export default SelectGroup;
