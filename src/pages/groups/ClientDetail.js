import { Box, Grid } from '@mui/material';
import MainCard from '../../components/MainCard';
import React from 'react';
import { useParams } from 'react-router';

const ClientDetail = () => {
    const params = useParams();
    const id_acc = params.id_acc;
    return (
        <MainCard title="Карточка клиента">
            <Box>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <h4>Основная информация:</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>ФИО</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Мосрег</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Дата оплаты</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Оплата</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Справка</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Договор</h4>
                    </Grid>
                </Grid>
            </Box>
        </MainCard>
    );
};

export default ClientDetail;
