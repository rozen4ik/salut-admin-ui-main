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
    const loadData = async () => {
        const response = await controller.getGroupCustomers(id_gr, selectedDate);
        setClients(response.tgclients);
    };

    useEffect(() => {
        loadData();
    }, []);

    let p;

    for (const d of clients) {
        console.log(d);
    }

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <PDFViewer width={'100%'} height={1080}>
                <Document>
                    <Page size="A6" style={styles.page}>
                        <View style={styles.section}>
                            <Text style={styles.Text}>Салют</Text>
                            <Text style={styles.Text}>{p}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.Text}>Платёжный № 123456</Text>
                            <Text style={styles.Text}>89997776655</Text>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </MainCard>
    );
};

SeasonTickets.proTypes = {};

export default SeasonTickets;
