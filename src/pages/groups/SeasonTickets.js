import { Page, Text, View, Document, StyleSheet, Font, PDFViewer } from '@react-pdf/renderer';
import { useSearchParams } from 'react-router-dom';
import MainCard from '../../components/MainCard';
import React, { useEffect, useState } from 'react';
import controller from '../../api/controller';

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

// Create Document Component
const SeasonTickets = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const id_gr = searchParams.get('id');
    const selectedDate = new Date(searchParams.get('selectedDate'));
    const [clients, setClients] = useState([]);
    const [group, setGroup] = useState([]);
    const loadData = async () => {
        let response = await controller.getGroupCustomers(id_gr, selectedDate);
        setClients(response.tgclients);
        response = await controller.getGroupsByType(id_gr);
        setGroup(response.tgroup);
    };

    useEffect(() => {
        loadData();
    }, []);

    let p;
    let da;
    let de;

    console.log(group);

    for (const d of clients) {
        p = d.people_initials;
        da = new Date(d.packages[d.packages.length - 1].date_start).toLocaleDateString();
        de = new Date(d.packages[d.packages.length - 1].date_end).toLocaleDateString();
    }

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <PDFViewer width={'100%'} height={1080}>
                <Document>
                    <Page size="A6" style={styles.page}>
                        <View style={styles.section}>
                            <p>
                                <Text style={styles.Text}>{'ФК Салют                                        Платёжный № 123456'}</Text>
                                <Text style={styles.Text}>{p}</Text>
                                <Text style={styles.Text}>Дата рождения:</Text>
                                <Text style={styles.Text}>
                                    Период действия: {da} - {de}
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
