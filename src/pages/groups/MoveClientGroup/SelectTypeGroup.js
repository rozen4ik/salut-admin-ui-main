import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import MainCard from '../../../components/MainCard';
import CTable from '../../../components/CTable';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import controller from '../../../api/controller';
import { useSearchParams } from 'react-router-dom';
import { id } from 'date-fns/locale';

const SelectTypeGroup = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const userData = JSON.parse(localStorage.getItem('user'));
    const instrId = userData?.employee.id_emp;
    const [groups, setGroups] = useState([]);
    const id_sp = searchParams.get('id_sp');
    const [open, setOpen] = React.useState(false);
    const [id_group, setIdGroup] = useState([]);

    const columns = [
        { label: 'id', field: 'tgt_id' },
        { label: 'Название', field: 'tgt_name' },
        { label: 'Комментарий', field: 'tgt_comment' }
    ];

    // const loadMoveClientGroup = async (id_sp, id_group) => {
    //     let response = await controller.moveClientInGroup(id_sp, id_group);
    //     console.log(response);
    // };

    const navigate = useNavigate();

    const onRowClick = (row) => {
        navigate('/select-instr/' + row.tgt_id);
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
        <MainCard title="Типы групп:">
            <Box>
                <CTable columns={columns} content={groups} onRowClick={onRowClick} keyProp={'tgt_id'} />
                {/*<Dialog open={open} onClose={handleClose}>*/}
                {/*    <DialogTitle>Подтверждение переноса</DialogTitle>*/}
                {/*    <DialogContent>*/}
                {/*        /!*<DialogContentText>Для подтверждения переноса клиента в спортивную группу введите свой логин.</DialogContentText>*!/*/}
                {/*        /!*<TextField margin="dense" id="name" label="Идентификатор" type="email" fullWidth variant="standard" />*!/*/}
                {/*    </DialogContent>*/}
                {/*    <DialogActions>*/}
                {/*        <Button onClick={handleClose}>Закрыть</Button>*/}
                {/*        <Button onClick={moveClient}>Перенести</Button>*/}
                {/*    </DialogActions>*/}
                {/*</Dialog>*/}
            </Box>
        </MainCard>
    );
};

export default SelectTypeGroup;
