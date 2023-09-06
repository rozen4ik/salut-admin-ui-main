import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import controller from '../../../api/controller';
import MainCard from '../../../components/MainCard';
import { Box } from '@mui/material';
import CTable from '../../../components/CTable';
import * as React from 'react';

const SelectInstr = () => {
    const params = useParams();
    const tgt_id = params.tgt_id;
    const [profiles, SetProfiles] = useState([]);
    const [instrlist, SetInstrList] = useState([]);

    let tren = [];
    const columns = [
        { label: 'id', field: 'id_emp' },
        { label: 'Имя', field: 'emp_name' }
    ];

    const GetProfiles = async () => {
        const response = await controller.getProfiles();
        SetProfiles(response.instrs);
    };

    useEffect(() => {
        GetProfiles();
    }, []);
    //
    return (
        <MainCard title="Треннера:">
            <Box>
                <CTable columns={columns} content={profiles} keyProp={profiles.id_emp} />
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

export default SelectInstr;
