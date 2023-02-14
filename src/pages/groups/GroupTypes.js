import React, { useEffect, useState } from 'react';
import MainCard from '../../components/MainCard';
import controller from '../../api/controller';
import List from '@mui/material/List';
import { ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const GroupTypes = () => {
    const [groupTypes, setGroupTypes] = useState([]);

    const getDate = async () => {
        const data = await controller.getGroupTypes();
        setGroupTypes(data.tgrouptypes);
    };

    useEffect(() => {
        getDate();
    }, []);

    return (
        <MainCard title="Все типы групп">
            <List disablePadding>
                {groupTypes.map((groupType) => (
                    <ListItemButton key={groupType.tgt_id} component={Link} to={`/groups/${groupType.tgt_id}`}>
                        <ListItemText primary={groupType.tgt_name} />
                    </ListItemButton>
                ))}
            </List>
        </MainCard>
    );
};

export default GroupTypes;
