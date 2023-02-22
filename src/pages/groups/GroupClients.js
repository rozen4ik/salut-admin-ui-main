import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MainCard from '../../components/MainCard';
import CTable from '../../components/CTable';
import { Checkbox, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import controller from '../../api/controller';
import './third-party/style.css';
import expressController from '../../api/ExpressController';

const GroupClients = () => {
    const c = [
        {
            field: 'payment',
            label: 'Оплата',
            render: (data) => findPackage(data.packages).price
        },
        {
            field: 'certificateUntil',
            label: 'Справка до',
            render: () => 'Не указано'
        },
        {
            field: 'contractUntil',
            label: 'Договор до',
            render: () => 'Не указано'
        }
    ];

    const userInfo = JSON.parse(localStorage.getItem('user'));
    const defaultDate = new Date();
    defaultDate.setDate(1);

    const { id } = useParams();
    const [clients, setClients] = useState([]);
    let [checkMos, setCheckMos] = useState([]);
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [columns, setColumns] = useState([...c]);
    const [visits, setVisits] = useState([]);
    let [isChecked, setIsChecked] = useState(false);

    const findActiveIdentifier = (identifiers) => {
        const lastActiveIdentifier = identifiers
            .filter((i) => {
                return i.active === '1';
            })
            .sort((a, b) => {
                return new Date(a.time_start).getTime() - new Date(b.time_start).getTime();
            });
        return lastActiveIdentifier[0];
    };

    function findPackage(packages) {
        let pkg;
        if (packages.length === 0) {
            pkg = packages[0];
        } else if (packages.length > 0) {
            const activePackage = packages.find((p) => p.id_sp_state === '80');
            if (activePackage) {
                pkg = activePackage;
            } else {
                const sorted = packages.sort((a, b) => {
                    return new Date(a.date_end).getTime() - new Date(b.date_end).getTime();
                });
                pkg = sorted[0];
            }
        } else {
            return null;
        }
        return pkg;
    }

    const handleMarkVisit = async (recordData, dayOfMonth) => {
        const dateToMark = new Date(selectedDate);
        dateToMark.setDate(dayOfMonth);
        const pkg = findPackage(recordData.packages);
        if (!pkg) {
            alert('У клиента нет пакетов');
            return;
        }
        const identifier = findActiveIdentifier(recordData.identifiers);
        await controller.createVisit(recordData.id_prs, userInfo?.employee.id_emp, identifier.identifier, pkg.id_sp, dateToMark);
        await loadData();
    };

    const loadData = async () => {
        const response = await controller.getGroupCustomers(id, selectedDate);
        setClients(response.tgclients);
        const visits = await controller.getVisits(userInfo?.employee.id_emp, selectedDate);
        setVisits(visits);
    };

    useEffect(() => {
        loadData();
        setDaysInMonth(getDaysInMonth(selectedDate));
    }, [selectedDate]);

    const checkbox = (recordData, dayOfMonth) => {
        let checked = false;
        if (visits.length > 0) {
            const dateToMark = new Date(selectedDate);
            dateToMark.setDate(dayOfMonth);
            dateToMark.setHours(24, 0, 0, 0);

            const visit = visits.find(
                (v) =>
                    v.visits_date.split('T')[0] === dateToMark.toISOString().split('T')[0] &&
                    Number(v.visits_clientId) === Number(recordData.id_prs)
            );

            if (visit) {
                checked = true;
            }
        }
        return <Checkbox onChange={() => handleMarkVisit(recordData, dayOfMonth)} checked={checked} disabled={checked} />;
    };

    // let mosreg = '';

    const loadGetMosReg = async () => {
        checkMos = await expressController.getMosReg();
    };

    function getKeyByValue(object, value) {
        return Object.values(object).find((key) => object[key] === value);
    }

    let count = -1;
    const mosregCheckBox = () => {
        let id_acc = 0;
        let db = [];
        let key;
        count++;
        if (clients.length > 0) {
            db = checkMos.data;
            id_acc = clients[count].id_acc;
            for (const d of db) {
                if (id_acc == d.id_acc) {
                    if (d.mosreg == 1) {
                        isChecked = true;
                    } else if (d.mosreg == 0) {
                        isChecked = false;
                    }
                    return <Checkbox onChange={() => checkHandler(id_acc)} defaultChecked={isChecked} id={toString(id_acc)} />;
                }
            }
            isChecked = false;
            return <Checkbox onChange={() => checkHandler(id_acc)} defaultChecked={isChecked} id={toString(id_acc)} />;
        }
    };

    const loadPostMosReg = async (id_acc, check) => {
        let pMosReg = '';
        if (check === true) {
            pMosReg = `{"id_acc":"${id_acc}","mosreg":"1"}`;
        } else {
            pMosReg = `{"id_acc":"${id_acc}","mosreg":"0"}`;
        }
        await expressController.postMosReg(pMosReg);
    };

    const checkHandler = (id_acc) => {
        let db = checkMos.data;
        let search = false;
        for (const d in db) {
            if (d.id_acc == id_acc) {
                search = true;
            }
        }
        console.log(search);
        if (search == false) {
            isChecked = true;
        } else {
            isChecked = isChecked !== true;
        }
        loadPostMosReg(id_acc, isChecked);
    };

    useEffect(() => {
        loadGetMosReg();
        setColumns([]);
        setTimeout(() => {
            setColumns([
                {
                    field: 'number_people',
                    label: '№'
                },
                {
                    field: 'people_initials',
                    label: 'ФИО'
                },
                {
                    field: 'id_acc',
                    label: 'МосРег',
                    render: () => mosregCheckBox()
                },
                ...c,
                ...Array.from({ length: daysInMonth }, (_, i) => ({
                    label: i + 1,
                    field: `day${i + 1}`,
                    render: (recordData) => checkbox(recordData, i + 1)
                }))
            ]);
        }, 0);
    }, [selectedDate, daysInMonth, visits]);

    return (
        <MainCard id="Schet" title={`Группа ${id}`}>
            <DatePicker
                views={['year', 'month']}
                label="Месяц, год"
                value={selectedDate}
                onChange={setSelectedDate}
                renderInput={(params) => <TextField {...params} helperText={null} />}
                inputFormat={'MM/yyyy'}
                openTo={'month'}
            />
            <hr></hr>
            <CTable sx={{ minWidth: 650 }} size="small" columns={columns} content={clients} keyProp={'id_prs'} />
        </MainCard>
    );
};

GroupClients.propTypes = {};

export default GroupClients;