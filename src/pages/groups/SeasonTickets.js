import { Page, Text, View, Document, StyleSheet, Font, PDFViewer } from '@react-pdf/renderer';
import { useSearchParams } from 'react-router-dom';
import MainCard from '../../components/MainCard';
import React, { useEffect, useState } from 'react';
import controller from '../../api/controller';
import ExpressController from '../../api/ExpressController';
import axios from 'axios';

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
});
// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        fontFamily: 'Roboto',
        backgroundColor: '#E4E4E4'
    },
    Text: {
        fontFamily: 'Roboto',
        fontSize: 10
    },
    section: {
        fontFamily: 'Roboto',
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});

const getInfo = (ident) => {
    const response = controller.getIdentInfo(ident);
    return respone;
};

// Create Document Component
const SeasonTickets = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const id_gr = searchParams.get('id');
    const selectedDate = new Date(searchParams.get('selectedDate'));
    const [clients, setClients] = useState([]);
    const [localClietns, setLocalClients] = useState([]);
    const [group, setGroup] = useState([]);
    const loadData = async () => {
        let response = await controller.getGroupCustomers(id_gr, selectedDate);
        setClients(response.tgclients);
        response = await controller.getGroupsByType(id_gr);
        setGroup(response.tgroup);
        response = await ExpressController.getClients();
        setLocalClients(response.data);
    };

    useEffect(() => {
        loadData();
    }, []);

    let fio;
    let date_start;
    let date_end;
    let identifier;
    let infoIdent;

    for (const d of clients) {
        for (const cl of localClietns) {
            if (cl.id_acc == d.id_acc) {
                fio = d.people_initials;
                date_start = new Date(d.packages[d.packages.length - 1].date_start).toLocaleDateString();
                date_end = new Date(d.packages[d.packages.length - 1].date_end).toLocaleDateString();
                identifier = d.identifiers[d.identifiers.length - 1].identifier;
                // infoIdent = axios({
                //     method: 'get',
                //     url: `http://81.200.31.254:33366/json-iapi/iapi-client?act=getidentinfo&identifier=${identifier}`,
                //     withCredentials: false,
                //     crossdomain: false,
                //     timeout: 300000,
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     // crossDomain: true,
                //     responseType: 'json'
                // }).then((response) => response.data);
                infoIdent = getInfo(identifier);
            }
        }
    }

    infoIdent.then((response) => {
        console.log(response);
    });

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <PDFViewer width={'100%'} height={1080}>
                <Document>
                    <Page size="A6" style={styles.page}>
                        <View style={styles.section}>
                            <p>
                                <Text
                                    style={styles.Text}
                                >{`ФК Салют                                        Платёжный № ${identifier}`}</Text>
                                <Text style={styles.Text}>{fio}</Text>
                                <Text style={styles.Text}>Дата рождения:</Text>
                                <Text style={styles.Text}>
                                    Период действия: {date_start} - {date_end}
                                </Text>
                                <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                <Text style={styles.Text}>Тренер: {group.tg_instr_initials}</Text>
                                <Text style={styles.Text}>Группа: {group.tg_name}</Text>
                                <Text style={styles.Text}>Время посещения:_________________________</Text>
                                <Text style={styles.Text}>Мед. справка действует до:</Text>
                                <Text style={styles.Text}>Таблица....</Text>
                                <Text style={styles.Text}>Правила оплаты</Text>
                            </p>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </MainCard>
    );
};

SeasonTickets.proTypes = {};

export default SeasonTickets;
