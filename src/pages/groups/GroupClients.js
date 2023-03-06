import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MainCard from '../../components/MainCard';
import { Box, Checkbox, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import controller from '../../api/controller';
import './third-party/style.css';
import expressController from '../../api/ExpressController';
import GroupClientTable from '../../components/GroupClientTable';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const GroupClients = () => {
    const c = [
        {
            field: 'date_start',
            label: 'Дата оплаты',
            render: (data) => new Date(findPackage(data.packages).date_change).toLocaleString()
        },
        {
            field: 'payment',
            label: 'Оплата',
            render: (data) => findPackage(data.packages).price
        },
        {
            field: 'certificateUntil',
            label: 'Справка до',
            render: () => certificate()
        },
        {
            field: 'contractUntil',
            label: 'Договор до',
            render: () => contract()
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

    const certificateHandle = (fio, id_acc, mosreg, certificateDate, contractDate) => {
        setCertificateValue(certificateDate);
        certificateValue = certificateDate;
        console.log(`${id_acc}: ${certificateValue}`);
        if (mosreg == 1) {
            loadPostClient(fio, id_acc, true, certificateDate, contractDate);
        } else if (mosreg == 0) {
            loadPostClient(fio, id_acc, false, certificateDate, contractDate);
        }
    };

    let [certificateValue, setCertificateValue] = React.useState(new Date());

    let countCer = -1;
    const certificate = () => {
        let fio;
        let id_acc = 0;
        let mosreg = 0;
        let certificateDate;
        let contractDate;
        let db = [];
        countCer++;
        if (clients.length > 0) {
            db = checkMos.data;
            try {
                console.log(clients[countCer].id_acc);
                fio = clients[countCer].people_initials;
                id_acc = clients[countCer].id_acc;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        if (d.certificateDate != null) {
                            certificateValue = d.certificateDate;
                        }
                        mosreg = d.mosreg;
                        certificateDate = certificateValue;
                        contractDate = d.contractDate;
                        return (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Custom input"
                                    value={certificateValue}
                                    onChange={(newValue) => {
                                        certificateHandle(fio, id_acc, mosreg, newValue, contractDate);
                                        location.reload();
                                    }}
                                    renderInput={({ inputRef, inputProps, InputProps }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <input ref={inputRef} {...inputProps} />
                                            {InputProps?.endAdornment}
                                        </Box>
                                    )}
                                />
                            </LocalizationProvider>
                        );
                    }
                }
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Custom input"
                            value={null}
                            onChange={(newValue) => {
                                contractHandle(fio, id_acc, mosreg, newValue, contractDate);
                                location.reload();
                            }}
                            renderInput={({ inputRef, inputProps, InputProps }) => (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <input ref={inputRef} {...inputProps} />
                                    {InputProps?.endAdornment}
                                </Box>
                            )}
                        />
                    </LocalizationProvider>
                );
            } catch (e) {
                console.log(e);
            }
        }
    };

    let [contractValue, setContractValue] = React.useState(new Date());
    const contractHandle = (fio, id_acc, mosreg, certificateDate, contractDate) => {
        setContractValue(contractDate);
        contractValue = contractDate;
        console.log(`${id_acc}: ${contractValue}`);
        // let db = checkMos.data;
        // let checkUser = 0;
        // for (const d of db) {
        //     if (d.id_acc == id_acc) {
        //         checkUser = 1;
        //     }
        // }
        //
        // if (checkUser == 0) {
        //     console.log('Нет юзура в базе');
        // } else {
        //     console.log('Есть юзер');
        // }
        if (mosreg == 1) {
            loadPostClient(fio, id_acc, true, certificateDate, contractDate);
        } else if (mosreg == 0) {
            loadPostClient(fio, id_acc, false, certificateDate, contractDate);
        }
    };

    let countContr = -1;
    const contract = () => {
        let fio;
        let id_acc = 0;
        let mosreg = 0;
        let certificateDate;
        let contractDate;
        let db = [];
        countContr++;
        if (clients.length > 0) {
            db = checkMos.data;
            try {
                console.log(clients[countContr].id_acc);
                fio = clients[countContr].people_initials;
                id_acc = clients[countContr].id_acc;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        if (d.contractDate != null) {
                            contractValue = d.contractDate;
                        }
                        mosreg = d.mosreg;
                        certificateDate = d.certificateDate;
                        contractDate = contractValue;
                        return (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Custom input"
                                    value={contractValue}
                                    onChange={(newValue) => {
                                        contractHandle(fio, id_acc, mosreg, certificateDate, newValue);
                                        location.reload();
                                    }}
                                    renderInput={({ inputRef, inputProps, InputProps }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <input ref={inputRef} {...inputProps} />
                                            {InputProps?.endAdornment}
                                        </Box>
                                    )}
                                />
                            </LocalizationProvider>
                        );
                    }
                }
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Custom input"
                            value={null}
                            onChange={(newValue) => {
                                contractHandle(fio, id_acc, mosreg, certificateDate, newValue);
                                location.reload();
                            }}
                            renderInput={({ inputRef, inputProps, InputProps }) => (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <input ref={inputRef} {...inputProps} />
                                    {InputProps?.endAdornment}
                                </Box>
                            )}
                        />
                    </LocalizationProvider>
                );
            } catch (e) {
                console.log(e);
            }
        }
    };

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
        return <Checkbox onChange={() => handleMarkVisit(recordData, dayOfMonth)} checked={checked} disabled={checked} size="small" />;
    };

    const loadGetClient = async () => {
        checkMos = await expressController.getClient();
    };

    let count = -1;
    const mosregCheckBox = () => {
        let fio;
        let id_acc = 0;
        let certificateDate;
        let contractDate;
        let db = [];
        count++;
        if (clients.length > 0) {
            // console.log(clients[count]);
            db = checkMos.data;
            try {
                fio = clients[count].people_initials;
                id_acc = clients[count].id_acc;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        certificateDate = d.certificateDate;
                        contractDate = d.contractDate;
                        if (d.mosreg == 1) {
                            isChecked = true;
                        } else if (d.mosreg == 0) {
                            isChecked = false;
                        }
                        return (
                            <Checkbox
                                onChange={() => {
                                    checkHandler(fio, id_acc, certificateDate, contractDate);
                                    location.reload();
                                }}
                                defaultChecked={isChecked}
                                id={toString(id_acc)}
                                size="small"
                            />
                        );
                    }
                }
                isChecked = false;
                return (
                    <Checkbox
                        onChange={() => {
                            checkHandler(fio, id_acc, certificateDate, contractDate);
                            location.reload();
                        }}
                        defaultChecked={isChecked}
                        id={toString(id_acc)}
                        size="small"
                    />
                );
            } catch (e) {
                console.log(e);
                // location.reload();
            }
        }
    };

    const loadPostClient = async (fio, id_acc, check, certificateDate, contractDate) => {
        let pMosReg = '';
        if (check === true) {
            pMosReg = `{"fio":"${fio}","id_acc":"${id_acc}","mosreg":"1","certificateDate":"${certificateDate}","contractDate":"${contractDate}"}`;
        } else {
            pMosReg = `{"fio":"${fio}","id_acc":"${id_acc}","mosreg":"0","certificateDate":"${certificateDate}","contractDate":"${contractDate}"}`;
        }
        await expressController.postClient(pMosReg);
    };

    const checkHandler = (fio, id_acc, certificateDate, contractDate) => {
        let db = checkMos.data;
        let search = false;
        for (const d of db) {
            if (d.id_acc == id_acc) {
                search = true;
                if (d.mosreg == 0) {
                    isChecked = true;
                } else if (d.mosreg == 1) {
                    isChecked = false;
                }
            }
        }
        if (search == false) {
            isChecked = true;
        }
        loadPostClient(fio, id_acc, isChecked, certificateDate, contractDate);
    };

    useEffect(() => {
        loadGetClient();
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
            <GroupClientTable columns={columns} content={clients} keyProp={'id_prs'} />
        </MainCard>
    );
};

GroupClients.propTypes = {};

export default GroupClients;
