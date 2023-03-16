import { Page, Text, View, Document, StyleSheet, Font, PDFViewer, Image } from '@react-pdf/renderer';
import { useSearchParams } from 'react-router-dom';
import MainCard from '../../components/MainCard';
import React, { useEffect, useState } from 'react';
import controller from '../../api/controller';
import ExpressController from '../../api/ExpressController';
import { Table, TableBody, TableCell, TableHeader } from '@david.kucsai/react-pdf-table';

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});
// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        fontFamily: 'Roboto'
    },
    Text: {
        fontFamily: 'Roboto',
        fontSize: 10,
        margin: 2
    },
    TextProd: {
        fontFamily: 'Roboto',
        fontSize: 6,
        margin: 2
    },
    image: {
        height: 80,
        width: 160,
        float: 'left'
    },
    section: {
        fontFamily: 'Roboto',
        margin: 10,
        padding: 10,
        flexGrow: 1,
        height: 419.53,
        width: 297.64
    }
});

// Create Document Component
const SeasonTickets = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const id_gr = searchParams.get('id');
    const selectedDate = new Date(searchParams.get('selectedDate'));
    const [clients, setClients] = useState([]);
    const [localClietns, setLocalClients] = useState([]);
    const [group, setGroup] = useState([]);
    const [clientPhone, setClientPhone] = useState([]);
    const [clientDate, setClientDate] = useState([]);
    const loadData = async () => {
        let response = await controller.getGroupCustomers(id_gr, selectedDate);
        setClients(response.tgclients);
        response = await controller.getGroupsByType(id_gr);
        setGroup(response.tgroup);
        response = await ExpressController.getClients();
        setLocalClients(response.data);
    };

    const getIdentInfo = async (ident) => {
        const response = await controller.getIdentInfo(ident);
        let phone = response.raw_html.toString().indexOf('Телефон');
        let clDate = response.raw_html.toString().indexOf('Дата рождения');

        if (phone != -1) {
            phone = `8${response.raw_html.toString().slice(phone + 11, phone + 21)}`;
            if (phone[1] == '-') {
                phone = '-';
            }
        }
        setClientPhone(phone);

        if (clDate != -1) {
            clDate = response.raw_html.toString().slice(clDate + 17, clDate + 27);
            if (clDate[0] == '-') {
                clDate = '-';
            }
        }
        setClientDate(clDate);
    };

    useEffect(() => {
        loadData();
    }, []);

    let fio;
    let date_start;
    let date_end;
    let identifier;
    let certificate;

    for (const d of clients) {
        for (const cl of localClietns) {
            if (cl.id_acc == d.id_acc) {
                fio = d.people_initials;
                date_start = new Date(d.packages[d.packages.length - 1].date_start).toLocaleDateString();
                date_end = new Date(d.packages[d.packages.length - 1].date_end).toLocaleDateString();
                identifier = d.identifiers[d.identifiers.length - 1].identifier;
                certificate = new Date(cl.certificateDate).toLocaleDateString();
                if (certificate == 'Invalid Date') {
                    certificate = 'Не указано';
                }
            }
        }
    }

    useEffect(() => {
        getIdentInfo(identifier);
    }, [identifier]);

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <PDFViewer width={'100%'} height={1080}>
                <Document>
                    <Page size="A6" style={styles.page}>
                        <View style={styles.section}>
                            <Image style={styles.image} src={'logo.png'} />
                            <Text style={styles.Text}>{`${fio}                                   Платёжный № ${identifier}`}</Text>
                            <Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>
                            <Text style={styles.Text}>Дата рождения: {clientDate}</Text>
                            <Text style={styles.Text}>
                                Период действия: {date_start} - {date_end}
                            </Text>
                            <Text style={styles.Text}>Стоимость:______________руб.</Text>
                            <Text style={styles.Text}>Тренер: {group.tg_instr_initials}</Text>
                            <Text style={styles.Text}>Группа: {group.tg_name}</Text>
                            <Text style={styles.Text}>Время посещения:_________________________</Text>
                            <Text style={styles.Text}>Мед. справка действует до: {certificate}</Text>
                            <Table>
                                <TableHeader fontSize={12} textAlign={'center'}>
                                    <TableCell style={{ height: 20 }}>Отметка о посещении</TableCell>
                                </TableHeader>
                                <TableBody>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableBody>
                            </Table>
                            <Table>
                                <TableHeader>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableHeader>
                                <TableBody>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableBody>
                            </Table>
                            <Table>
                                <TableHeader>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableHeader>
                                <TableBody>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableBody>
                            </Table>
                            <Table>
                                <TableHeader>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableHeader>
                                <TableBody>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                    <TableCell style={{ height: 20 }}></TableCell>
                                </TableBody>
                            </Table>
                            <Text style={styles.TextProd}>
                                Оплачивая данный абонемент, вы подтверждаете, что ознакомились с правилами АУ ФСК «Салют» и полностью
                                согласны с ними.
                            </Text>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </MainCard>
    );
};

SeasonTickets.proTypes = {};

export default SeasonTickets;
