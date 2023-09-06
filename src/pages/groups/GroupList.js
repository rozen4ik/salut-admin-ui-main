import { Box } from '@mui/material';
import MainCard from '../../components/MainCard';
import CTable from '../../components/CTable';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import controller from '../../api/controller';

const GroupList = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const instrId = userData?.employee.id_emp;
    const [groups, setGroups] = useState([]);
    const columns = [
        { label: 'Название', field: 'tg_name' },
        { label: 'Дата обновления', field: 'tg_date_change' },
        { label: 'Комментарий', field: 'tg_comment' }
    ];

    const navigate = useNavigate();

    const onRowClick = (row) => {
        navigate('/group-clients/' + row.tg_id);
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
                <CTable columns={columns} content={groups} onRowClick={onRowClick} keyProp={'tg_id'} />
            </Box>
        </MainCard>
    );
};

export default GroupList;
