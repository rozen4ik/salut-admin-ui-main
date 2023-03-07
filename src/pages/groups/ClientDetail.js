import { Box, Grid } from '@mui/material';
import MainCard from '../../components/MainCard';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import expressController from '../../api/ExpressController';

const ClientDetail = () => {
    const params = useParams();
    const id_acc = params.id_acc;
    let client = useState([]);

    useEffect(() => {
        loadGetClientDetail();
    });

    const loadGetClientDetail = async () => {
        client = await expressController.getDetailClient(id_acc);
        console.log(client[0]);
    };

    return (
        <MainCard title="Карточка клиента">
            <Box>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <h4>Основная информация:</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>ФИО: {client[0]}</h4>
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
