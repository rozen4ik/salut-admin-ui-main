import React, { useEffect } from 'react';
import MainCard from '../../components/MainCard';
import List from '@mui/material/List';
import { ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import controller from '../../api/controller';

const TrainersList = () => {
    const [trainers, setTrainers] = React.useState([]);

    const loadTrainers = async () => {
        const employees = await controller.getEmployees();
        setTrainers(employees.employee);
    };

    useEffect(() => {
        loadTrainers();
    }, []);

    return (
        <MainCard title="Тренеры">
            <h2>Выберите себя в списке</h2>
            <List disablePadding>
                {trainers.map((trainer) => (
                    <ListItemButton key={trainer.id} component={Link} to={`/instr-group/${trainer.id}`}>
                        <ListItemText primary={trainer.full_name} />
                    </ListItemButton>
                ))}
            </List>
        </MainCard>
    );
};

export default TrainersList;
