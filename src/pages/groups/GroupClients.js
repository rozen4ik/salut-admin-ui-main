import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MainCard from '../../components/MainCard';
import CTable from '../../components/CTable';
import { Checkbox, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import controller from '../../api/controller';

const GroupClients = () => {
    const c = [
        {
            field: 'people_initials',
            label: 'ФИО'
        },
        {
            field: 'mosReg',
            label: 'МосРег',
            render: () => <Checkbox disabled />
        },
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
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [columns, setColumns] = useState([...c]);
    const [visits, setVisits] = useState([]);

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

    useEffect(() => {
        setColumns([]);
        setTimeout(() => {
            setColumns([
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
        <MainCard title={`Группа ${id}`}>
            <DatePicker
                views={['year', 'month']}
                label="Месяц, год"
                value={selectedDate}
                onChange={setSelectedDate}
                renderInput={(params) => <TextField {...params} helperText={null} />}
                inputFormat={'MM/yyyy'}
                openTo={'month'}
            />
            <CTable columns={columns} content={clients} keyProp={'id_prs'} />
        </MainCard>
    );
};

GroupClients.propTypes = {};

export default GroupClients;
