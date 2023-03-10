import { Box, Checkbox, Grid, TextField } from '@mui/material';
import MainCard from '../../components/MainCard';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import expressController from '../../api/ExpressController';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import './third-party/style.css';

const ClientDetail = () => {
    const params = useParams();
    const id_acc = params.id_acc;
    const [client, setClient] = useState([]);
    let [isChecked] = useState(false);
    let [contractValue] = useState(false);

    useEffect(() => {
        loadGetClientDetail();
    }, []);

    const loadGetClientDetail = async () => {
        let response = await expressController.getDetailClient(id_acc);
        setClient(response[0]);
    };

    const checkHandler = () => {
        if (isChecked == false) {
            isChecked = true;
        } else {
            isChecked = false;
        }
        loadPostClient(
            client.fio,
            client.id_acc,
            isChecked,
            client.datePayment,
            client.payment,
            client.certificateDate,
            client.contractDate
        );
        location.reload();
    };

    const contractHandler = () => {
        if (contractValue == false) {
            contractValue = true;
        } else {
            contractValue = false;
        }
        loadPostClient(client.fio, client.id_acc, client.mosreg, client.datePayment, client.payment, client.certificateDate, contractValue);
        location.reload();
    };

    const loadPostClient = async (fio, id_acc, check, datePayment, payment, certificateDate, contractDate) => {
        let pMosReg = '';
        let checkMos;
        let checkContract;
        if (check == 1 || check == 0) {
            checkMos = check;
        }
        if (contractDate == 1 || contractDate == 0) {
            checkContract = contractDate;
        }
        if (check == true) {
            checkMos = 1;
        } else {
            checkMos = 0;
        }
        if (contractDate == true) {
            checkContract = 1;
        } else {
            checkContract = 0;
        }
        pMosReg = `{"fio":"${fio}","id_acc":"${id_acc}","mosreg":"${checkMos}","datePayment":"${datePayment}","payment":"${payment}","certificateDate":"${certificateDate}","contractDate":"${checkContract}"}`;
        await expressController.postClient(pMosReg);
    };

    const certificateHandle = (certificateDate) => {
        setCertificateValue(certificateDate);
        certificateValue = certificateDate;
        let check = client.mosreg == 1;
        loadPostClient(client.fio, client.id_acc, check, client.datePayment, client.payment, certificateDate, client.contractDate);
    };

    let [certificateValue, setCertificateValue] = React.useState(new Date());

    if (client.mosreg == 0) {
        isChecked = false;
    } else if (client.mosreg == 1) {
        isChecked = true;
    }

    certificateValue = client.certificateDate;

    if (client.contractDate == 0) {
        contractValue = false;
    } else if (client.contractDate == 1) {
        contractValue = true;
    }

    return (
        <MainCard title="Карточка клиента">
            <Box>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <h4>Основная информация:</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>ФИО:</h4>
                        <p>{client.fio}</p>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Мосрег:</h4>
                        <Checkbox
                            onChange={() => {
                                checkHandler();
                            }}
                            checked={isChecked}
                            id={toString(id_acc)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Дата оплаты:</h4>
                        <p> {client.datePayment}</p>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Оплата:</h4>
                        <p>{client.payment}</p>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Справка</h4>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Дата окончания справки"
                                value={certificateValue}
                                onChange={(newValue) => {
                                    certificateHandle(newValue);
                                    location.reload();
                                }}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Договор</h4>
                        <Checkbox
                            onChange={() => {
                                contractHandler();
                            }}
                            checked={contractValue}
                            id={toString(id_acc)}
                        />
                    </Grid>
                </Grid>
            </Box>
        </MainCard>
    );
};

export default ClientDetail;
