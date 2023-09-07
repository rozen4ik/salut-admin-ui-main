import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import controller from '../../../api/controller';
import MainCard from '../../../components/MainCard';
import { Box } from '@mui/material';
import CTable from '../../../components/CTable';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

const SelectInstr = () => {
    const [profiles, SetProfiles] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const id_sp = searchParams.get('id_sp');
    const columns = [
        { label: 'id', field: 'id_emp' },
        { label: 'Имя', field: 'emp_name' }
    ];

    const navigate = useNavigate();

    const onRowClick = (row) => {
        navigate('/select-group/' + row.id_emp + '?id_sp=' + id_sp);
    };

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
                <CTable columns={columns} content={profiles} onRowClick={onRowClick} keyProp={profiles.id_emp} />
            </Box>
        </MainCard>
    );
};

export default SelectInstr;
