import { Grid, Typography } from '@mui/material';
import React from 'react';
import TrainersList from '../employees/TrainersList';
import { Link } from 'react-router-dom';
import GroupTypes from '../groups/GroupTypes';

// assets

// avatar style
const avatarSX = {
    width: 36,
    height: 36,
    fontSize: '1rem'
};

// action style
const actionSX = {
    mt: 0.75,
    ml: 1,
    top: 'auto',
    right: 'auto',
    alignSelf: 'flex-start',
    transform: 'none'
};

// sales report status
const status = [
    {
        value: 'today',
        label: 'Today'
    },
    {
        value: 'month',
        label: 'This Month'
    },
    {
        value: 'year',
        label: 'This Year'
    }
];

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
    return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            <Grid item xs={12} sx={{ mb: -2.25 }}>
                <Typography variant="h5">Главная</Typography>
            </Grid>

            <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
            <Grid item xs={12} md={7} lg={8}>
                <Link to={`/instr-group`}>Посмотреть мои группы</Link>
                {/*<GroupTypes />*/}
            </Grid>
        </Grid>
    );
};

export default DashboardDefault;
