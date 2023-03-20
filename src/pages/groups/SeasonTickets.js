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
        width: 290,
        height: 400,
        flexDirection: 'column'
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

    let c = 0;
    let fio;
    let date_start;
    let date_end;
    let identifier;
    let certificate;
    const myPdf = [];

    for (const d of clients) {
        fio = d.people_initials;
        date_start = new Date(d.packages[d.packages.length - 1].date_start).toLocaleDateString();
        date_end = new Date(d.packages[d.packages.length - 1].date_end).toLocaleDateString();
        identifier = d.identifiers[d.identifiers.length - 1].identifier;
        for (const cl of localClietns) {
            if (cl.id_acc == d.id_acc) {
                c = 1;
                certificate = new Date(cl.certificateDate).toLocaleDateString();
                if (certificate == 'Invalid Date') {
                    certificate = 'Не указано';
                }
                myPdf.push({
                    fio: fio,
                    date_start: date_start,
                    date_end: date_end,
                    identifier: identifier,
                    certificate: certificate,
                    // { clientPhone: phone },
                    // { clientDate: clDate },
                    tg_instr_initials: group.tg_instr_initials,
                    tg_name: group.tg_name
                });
            }
        }
        if (c == 0) {
            certificate = 'Не указано';
            myPdf.push({
                fio: fio,
                date_start: date_start,
                date_end: date_end,
                identifier: identifier,
                certificate: certificate,
                // { clientPhone: phone },
                // { clientDate: clDate },
                tg_instr_initials: group.tg_instr_initials,
                tg_name: group.tg_name
            });
        }
        c = 0;
    }

    console.log(myPdf);

    // useEffect(() => {
    //     getIdentInfo(identifier);
    // }, [identifier]);
    let indexOne = -2;
    let indexTwo = -1;
    let indexThree = myPdf.length + 1;
    let indexFour = myPdf.length;
    let stop = 0;

    const result = myPdf.map((value, index, array) => {
        indexOne += 2;
        indexTwo += 2;
        indexThree -= 2;
        indexFour -= 2;
        if (
            indexOne <= myPdf.length - 1 &&
            indexTwo <= myPdf.length - 1 &&
            indexThree <= myPdf.length - 1 &&
            indexFour <= myPdf.length - 1
        ) {
            if (indexTwo == indexFour) {
                stop = 1;
                console.log(indexOne, indexTwo, indexThree, indexFour, 'середина');
                return (
                    <Page key={myPdf[index].identifier} size="A4" style={styles.page}>
                        <View>
                            <View style={styles.section}>
                                <Image style={styles.image} src={'logo.png'} />
                                <Text
                                    style={styles.Text}
                                >{`${myPdf[indexOne].fio}                               Платёжный № ${myPdf[indexOne].identifier}`}</Text>
                                {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                <Text style={styles.Text}>
                                    Период действия: {myPdf[indexOne].date_start} - {myPdf[indexOne].date_end}
                                </Text>
                                <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                <Text style={styles.Text}>Тренер: {myPdf[indexOne].tg_instr_initials}</Text>
                                <Text style={styles.Text}>Группа: {myPdf[indexOne].tg_name}</Text>
                                <Text style={styles.Text}>Время посещения:_________________________</Text>
                                <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexOne].certificate}</Text>
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
                            <View style={styles.section}>
                                <Image style={styles.image} src={'logo.png'} />
                                <Text
                                    style={styles.Text}
                                >{`${myPdf[indexTwo].fio}                               Платёжный № ${myPdf[indexTwo].identifier}`}</Text>
                                {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                <Text style={styles.Text}>
                                    Период действия: {myPdf[indexTwo].date_start} - {myPdf[indexTwo].date_end}
                                </Text>
                                <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                <Text style={styles.Text}>Тренер: {myPdf[indexTwo].tg_instr_initials}</Text>
                                <Text style={styles.Text}>Группа: {myPdf[indexTwo].tg_name}</Text>
                                <Text style={styles.Text}>Время посещения:_________________________</Text>
                                <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexTwo].certificate}</Text>
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
                        </View>
                        <View>
                            <View style={styles.section}>
                                <Image style={styles.image} src={'logo.png'} />
                                <Text
                                    style={styles.Text}
                                >{`${myPdf[indexThree].fio}                               Платёжный № ${myPdf[indexThree].identifier}`}</Text>
                                {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                <Text style={styles.Text}>
                                    Период действия: {myPdf[indexThree].date_start} - {myPdf[indexThree].date_end}
                                </Text>
                                <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                <Text style={styles.Text}>Тренер: {myPdf[indexThree].tg_instr_initials}</Text>
                                <Text style={styles.Text}>Группа: {myPdf[indexThree].tg_name}</Text>
                                <Text style={styles.Text}>Время посещения:_________________________</Text>
                                <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexThree].certificate}</Text>
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
                        </View>
                    </Page>
                );
            } else if (indexOne == indexThree) {
                stop = 1;
                console.log(indexOne, indexTwo, indexThree, indexFour, 'середина');
                return (
                    <Page key={myPdf[index].identifier} size="A4" style={styles.page}>
                        <View>
                            <View style={styles.section}>
                                <Image style={styles.image} src={'logo.png'} />
                                <Text
                                    style={styles.Text}
                                >{`${myPdf[indexOne].fio}                               Платёжный № ${myPdf[indexOne].identifier}`}</Text>
                                {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                <Text style={styles.Text}>
                                    Период действия: {myPdf[indexOne].date_start} - {myPdf[indexOne].date_end}
                                </Text>
                                <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                <Text style={styles.Text}>Тренер: {myPdf[indexOne].tg_instr_initials}</Text>
                                <Text style={styles.Text}>Группа: {myPdf[indexOne].tg_name}</Text>
                                <Text style={styles.Text}>Время посещения:_________________________</Text>
                                <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexOne].certificate}</Text>
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
                        </View>
                    </Page>
                );
            } else {
                console.log(indexOne, indexTwo, indexThree, indexFour);
                if (stop != 1) {
                    return (
                        <Page key={myPdf[index].identifier} size="A4" style={styles.page}>
                            <View>
                                <View style={styles.section}>
                                    <Image style={styles.image} src={'logo.png'} />
                                    <Text
                                        style={styles.Text}
                                    >{`${myPdf[indexOne].fio}                               Платёжный № ${myPdf[indexOne].identifier}`}</Text>
                                    {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                    {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                    <Text style={styles.Text}>
                                        Период действия: {myPdf[indexOne].date_start} - {myPdf[indexOne].date_end}
                                    </Text>
                                    <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                    <Text style={styles.Text}>Тренер: {myPdf[indexOne].tg_instr_initials}</Text>
                                    <Text style={styles.Text}>Группа: {myPdf[indexOne].tg_name}</Text>
                                    <Text style={styles.Text}>Время посещения:_________________________</Text>
                                    <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexOne].certificate}</Text>
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
                                        Оплачивая данный абонемент, вы подтверждаете, что ознакомились с правилами АУ ФСК «Салют» и
                                        полностью согласны с ними.
                                    </Text>
                                </View>
                                <View style={styles.section}>
                                    <Image style={styles.image} src={'logo.png'} />
                                    <Text
                                        style={styles.Text}
                                    >{`${myPdf[indexTwo].fio}                               Платёжный № ${myPdf[indexTwo].identifier}`}</Text>
                                    {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                    {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                    <Text style={styles.Text}>
                                        Период действия: {myPdf[indexTwo].date_start} - {myPdf[indexTwo].date_end}
                                    </Text>
                                    <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                    <Text style={styles.Text}>Тренер: {myPdf[indexTwo].tg_instr_initials}</Text>
                                    <Text style={styles.Text}>Группа: {myPdf[indexTwo].tg_name}</Text>
                                    <Text style={styles.Text}>Время посещения:_________________________</Text>
                                    <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexTwo].certificate}</Text>
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
                                        Оплачивая данный абонемент, вы подтверждаете, что ознакомились с правилами АУ ФСК «Салют» и
                                        полностью согласны с ними.
                                    </Text>
                                </View>
                            </View>
                            <View>
                                <View style={styles.section}>
                                    <Image style={styles.image} src={'logo.png'} />
                                    <Text
                                        style={styles.Text}
                                    >{`${myPdf[indexThree].fio}                               Платёжный № ${myPdf[indexThree].identifier}`}</Text>
                                    {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                    {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                    <Text style={styles.Text}>
                                        Период действия: {myPdf[indexThree].date_start} - {myPdf[indexThree].date_end}
                                    </Text>
                                    <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                    <Text style={styles.Text}>Тренер: {myPdf[indexThree].tg_instr_initials}</Text>
                                    <Text style={styles.Text}>Группа: {myPdf[indexThree].tg_name}</Text>
                                    <Text style={styles.Text}>Время посещения:_________________________</Text>
                                    <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexThree].certificate}</Text>
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
                                        Оплачивая данный абонемент, вы подтверждаете, что ознакомились с правилами АУ ФСК «Салют» и
                                        полностью согласны с ними.
                                    </Text>
                                </View>
                                <View style={styles.section}>
                                    <Image style={styles.image} src={'logo.png'} />
                                    <Text
                                        style={styles.Text}
                                    >{`${myPdf[indexFour].fio}                               Платёжный № ${myPdf[indexFour].identifier}`}</Text>
                                    {/*<Text style={styles.Text}>{`Телефон: ${clientPhone}`}</Text>*/}
                                    {/*<Text style={styles.Text}>Дата рождения: {clientDate}</Text>*/}
                                    <Text style={styles.Text}>
                                        Период действия: {myPdf[indexFour].date_start} - {myPdf[indexFour].date_end}
                                    </Text>
                                    <Text style={styles.Text}>Стоимость:______________руб.</Text>
                                    <Text style={styles.Text}>Тренер: {myPdf[indexFour].tg_instr_initials}</Text>
                                    <Text style={styles.Text}>Группа: {myPdf[indexFour].tg_name}</Text>
                                    <Text style={styles.Text}>Время посещения:_________________________</Text>
                                    <Text style={styles.Text}>Мед. справка действует до: {myPdf[indexFour].certificate}</Text>
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
                                        Оплачивая данный абонемент, вы подтверждаете, что ознакомились с правилами АУ ФСК «Салют» и
                                        полностью согласны с ними.
                                    </Text>
                                </View>
                            </View>
                        </Page>
                    );
                }
            }
        }
    });

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <PDFViewer width={'100%'} height={1080}>
                <Document title={'Абонементы'}>{result}</Document>
            </PDFViewer>
        </MainCard>
    );
};

SeasonTickets.proTypes = {};

export default SeasonTickets;
