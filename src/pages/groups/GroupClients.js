import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MainCard from '../../components/MainCard';
import { Button, Checkbox, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import controller from '../../api/controller';
import './third-party/style.css';
import expressController from '../../api/ExpressController';
import GroupClientTable from '../../components/GroupClientTable';

const GroupClients = () => {
    const c = [
        {
            field: 'date_start',
            label: 'Дата оплаты',
            render: (data) => new Date(findPackage(data.packages).date_change).toLocaleDateString()
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
    const [checkMos, setCheckMos] = useState([]);
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [columns, setColumns] = useState([...c]);
    const [visits, setVisits] = useState([]);
    let [isChecked] = useState(false);
    let [contractValue] = useState(false);
    const debugUrl = 'localhost:3000';
    const releaseUrl = '81.200.31.254:3000';
    const url = debugUrl;

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
            const activePackage = packages[packages.length - 1];
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

    const handleMarkVisit = async (recordData, dayOfMonth, id_sp, id_resolution) => {
        if (id_sp != 'no' && id_resolution != 'no') {
            await loadData();
        } else {
            const dateToMark = new Date(selectedDate);
            dateToMark.setDate(dayOfMonth);
            const pkg = findPackage(recordData.packages);
            if (!pkg) {
                alert('У клиента нет пакетов');
                return;
            }
            const identifier = findActiveIdentifier(recordData.identifiers);
            await controller.createVisit(recordData.id_prs, userInfo?.employee.id_emp, identifier.identifier, pkg.id_sp, dateToMark);
        }
        await loadData();
    };

    const loadData = async () => {
        const response = await controller.getGroupCustomers(id, selectedDate);
        setClients(response.tgclients);
        const visits = response.tgclients;
        const resCheckMos = await expressController.getClients();
        setCheckMos(resCheckMos);
        setVisits(visits);
    };

    useEffect(() => {
        loadData();
        setDaysInMonth(getDaysInMonth(selectedDate));
    }, [selectedDate]);

    let countCer = -1;
    const certificate = () => {
        let id_acc = 0;
        let certificateDate;
        let db = [];
        countCer++;
        if (clients.length > 0) {
            db = checkMos.data;
            try {
                id_acc = clients[countCer].id_acc;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        certificateDate = d.certificateDate;
                        if (certificateDate == 'undefined') {
                            return <p>Не указано</p>;
                        } else {
                            return <p>{new Date(certificateDate).toLocaleDateString()}</p>;
                        }
                    }
                }
                return <p>Не указано</p>;
            } catch (e) {
                let a = e;
            }
        }
    };

    const contractHandle = (fio, id_acc, mosreg, datePayment, payment, certificateDate) => {
        let db = checkMos.data;
        let search = false;
        for (const d of db) {
            if (d.id_acc == id_acc) {
                search = true;
                if (d.contractDate == 0) {
                    contractValue = true;
                } else if (d.contractDate == 1) {
                    contractValue = false;
                }
            }
        }
        if (search == false) {
            contractValue = true;
        }
        loadPostClient(fio, id_acc, mosreg, datePayment, payment, certificateDate, contractValue);
    };

    let countContr = -1;
    const contract = () => {
        let fio;
        let id_acc = 0;
        let mosreg;
        let datePayment;
        let payment;
        let certificateDate;
        let db = [];
        let packagLen = 0;
        countContr++;
        if (clients.length > 0) {
            db = checkMos.data;
            try {
                packagLen = clients[countContr].packages.length - 1;
                fio = clients[countContr].people_initials;
                id_acc = clients[countContr].id_acc;
                datePayment = new Date(clients[countContr].packages[packagLen].date_start).toLocaleDateString();
                payment = clients[countContr].packages[packagLen].price;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        mosreg = d.mosreg;
                        certificateDate = d.certificateDate;
                        if (d.contractDate == 1) {
                            contractValue = true;
                        } else if (d.contractDate == 0) {
                            contractValue = false;
                        }
                        return (
                            <Checkbox
                                onChange={() => {
                                    contractHandle(fio, id_acc, mosreg, datePayment, payment, certificateDate);
                                    location.reload();
                                }}
                                defaultChecked={contractValue}
                                id={toString(id_acc)}
                                size="small"
                            />
                        );
                    }
                }
                contractValue = false;
                mosreg = 0;
                return (
                    <Checkbox
                        onChange={() => {
                            contractHandle(fio, id_acc, mosreg, datePayment, payment, certificateDate);
                            location.reload();
                        }}
                        defaultChecked={contractValue}
                        id={toString(id_acc)}
                        size="small"
                    />
                );
            } catch (e) {
                let a = e;
            }
        }
    };

    let month = `${selectedDate.toLocaleDateString()[3]}${selectedDate.toLocaleDateString()[4]}`;

    let countCheckBox1 = -1;
    const checkbox1 = (recordData, dayOfMonth) => {
        countCheckBox1++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox1].packages.length - 1;
                if (clients[countCheckBox1].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox1].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox1].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox2 = -1;
    const checkbox2 = (recordData, dayOfMonth) => {
        countCheckBox2++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox2].packages.length - 1;
                if (clients[countCheckBox2].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox2].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox2].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox3 = -1;
    const checkbox3 = (recordData, dayOfMonth) => {
        countCheckBox3++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox3].packages.length - 1;
                if (clients[countCheckBox3].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox3].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox3].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox4 = -1;
    const checkbox4 = (recordData, dayOfMonth) => {
        countCheckBox4++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox4].packages.length - 1;
                if (clients[countCheckBox4].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox4].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox4].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox5 = -1;
    const checkbox5 = (recordData, dayOfMonth) => {
        countCheckBox5++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox5].packages.length - 1;
                if (clients[countCheckBox5].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox5].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox5].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox6 = -1;
    const checkbox6 = (recordData, dayOfMonth) => {
        countCheckBox6++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox6].packages.length - 1;
                if (clients[countCheckBox6].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox6].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox6].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox7 = -1;
    const checkbox7 = (recordData, dayOfMonth) => {
        countCheckBox7++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox7].packages.length - 1;
                if (clients[countCheckBox7].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox7].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox7].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox8 = -1;
    const checkbox8 = (recordData, dayOfMonth) => {
        countCheckBox8++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox8].packages.length - 1;
                if (clients[countCheckBox8].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox8].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox8].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox9 = -1;
    const checkbox9 = (recordData, dayOfMonth) => {
        countCheckBox9++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox9].packages.length - 1;
                if (clients[countCheckBox9].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox9].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox9].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox10 = -1;
    const checkbox10 = (recordData, dayOfMonth) => {
        countCheckBox10++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox10].packages.length - 1;
                if (clients[countCheckBox10].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox10].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox10].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox11 = -1;
    const checkbox11 = (recordData, dayOfMonth) => {
        countCheckBox11++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox11].packages.length - 1;
                if (clients[countCheckBox11].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox11].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox11].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox12 = -1;
    const checkbox12 = (recordData, dayOfMonth) => {
        countCheckBox12++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox12].packages.length - 1;
                if (clients[countCheckBox12].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox12].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox12].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox13 = -1;
    const checkbox13 = (recordData, dayOfMonth) => {
        countCheckBox13++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox13].packages.length - 1;
                if (clients[countCheckBox13].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox13].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox13].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox14 = -1;
    const checkbox14 = (recordData, dayOfMonth) => {
        countCheckBox14++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox14].packages.length - 1;
                if (clients[countCheckBox14].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox14].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox14].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox15 = -1;
    const checkbox15 = (recordData, dayOfMonth) => {
        countCheckBox15++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox15].packages.length - 1;
                if (clients[countCheckBox15].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox15].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox15].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox16 = -1;
    const checkbox16 = (recordData, dayOfMonth) => {
        countCheckBox16++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox16].packages.length - 1;
                if (clients[countCheckBox16].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox16].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox16].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox17 = -1;
    const checkbox17 = (recordData, dayOfMonth) => {
        countCheckBox17++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox17].packages.length - 1;
                if (clients[countCheckBox17].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox17].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox7].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox18 = -1;
    const checkbox18 = (recordData, dayOfMonth) => {
        countCheckBox18++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox18].packages.length - 1;
                if (clients[countCheckBox18].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox18].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox18].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox19 = -1;
    const checkbox19 = (recordData, dayOfMonth) => {
        countCheckBox19++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox19].packages.length - 1;
                if (clients[countCheckBox19].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox19].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox19].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox20 = -1;
    const checkbox20 = (recordData, dayOfMonth) => {
        countCheckBox20++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox20].packages.length - 1;
                if (clients[countCheckBox20].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox20].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox20].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox21 = -1;
    const checkbox21 = (recordData, dayOfMonth) => {
        countCheckBox21++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox21].packages.length - 1;
                if (clients[countCheckBox21].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox21].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox21].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox22 = -1;
    const checkbox22 = (recordData, dayOfMonth) => {
        countCheckBox22++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox22].packages.length - 1;
                if (clients[countCheckBox22].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox22].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox22].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox23 = -1;
    const checkbox23 = (recordData, dayOfMonth) => {
        countCheckBox23++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox23].packages.length - 1;
                if (clients[countCheckBox23].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox23].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox23].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox24 = -1;
    const checkbox24 = (recordData, dayOfMonth) => {
        countCheckBox24++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox24].packages.length - 1;
                if (clients[countCheckBox24].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox24].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox24].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox25 = -1;
    const checkbox25 = (recordData, dayOfMonth) => {
        countCheckBox25++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox25].packages.length - 1;
                if (clients[countCheckBox25].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox25].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox25].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox26 = -1;
    const checkbox26 = (recordData, dayOfMonth) => {
        countCheckBox26++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox26].packages.length - 1;
                if (clients[countCheckBox26].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox26].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox26].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox27 = -1;
    const checkbox27 = (recordData, dayOfMonth) => {
        countCheckBox27++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox27].packages.length - 1;
                if (clients[countCheckBox27].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox27].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox27].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox28 = -1;
    const checkbox28 = (recordData, dayOfMonth) => {
        countCheckBox28++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox28].packages.length - 1;
                if (clients[countCheckBox28].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox28].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox28].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox29 = -1;
    const checkbox29 = (recordData, dayOfMonth) => {
        countCheckBox29++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox29].packages.length - 1;
                if (clients[countCheckBox29].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox29].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox29].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox30 = -1;
    const checkbox30 = (recordData, dayOfMonth) => {
        countCheckBox30++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox30].packages.length - 1;
                if (clients[countCheckBox30].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox30].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox30].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    let countCheckBox31 = -1;
    const checkbox31 = (recordData, dayOfMonth) => {
        countCheckBox31++;
        let checked = false;
        let daysPU = '';
        let monthPU = '';
        let id_sp = 'no';
        let id_resolution = 'no';
        let packageLen = 0;
        if (clients.length > 0) {
            try {
                packageLen = clients[countCheckBox31].packages.length - 1;
                if (clients[countCheckBox31].packages[packageLen].package_uses == 0) {
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                } else {
                    for (const pu of clients[countCheckBox31].packages[packageLen].package_uses) {
                        daysPU = pu.time_move.toString();
                        daysPU = `${daysPU[0]}${daysPU[1]}`;

                        monthPU = pu.time_move.toString();
                        monthPU = `${monthPU[3]}${monthPU[4]}`;

                        if (monthPU == month) {
                            if (daysPU[0] == '0') {
                                daysPU = daysPU[1];
                            }

                            if (daysPU == dayOfMonth) {
                                id_sp = clients[countCheckBox31].packages[packageLen].id_sp;
                                id_resolution = pu.id_resolution;
                                checked = true;
                                break;
                            }
                        }
                    }
                    return (
                        <Checkbox
                            onChange={() => handleMarkVisit(recordData, dayOfMonth, id_sp, id_resolution)}
                            defaultChecked={checked}
                            size="small"
                        />
                    );
                }
            } catch (e) {
                let a = e;
            }
        }
    };

    const linkFioChacnge = (fio, id_acc, mosreg, datePayment, payment, certificateDate, contractDate) => {
        loadPostClient(fio, id_acc, mosreg, datePayment, payment, certificateDate, contractDate);
    };

    let countFio = -1;
    const linkFio = () => {
        let identifiers;
        let identifierList = [];
        let identifier;
        let fio;
        let id_acc;
        let mosreg;
        let datePayment;
        let payment;
        let certificateDate;
        let contractDate;
        let db = [];
        let packageLen = 0;
        countFio++;
        if (clients.length > 0) {
            try {
                packageLen = clients[countFio].packages.length - 1;
                identifiers = clients[countFio].identifiers;
                for (const c of identifiers) {
                    if (c.rule == 'Клиент САЛЮТ') {
                        identifierList.push(c);
                    }
                }
                identifier = identifierList[identifierList.length - 1].identifier;
                db = checkMos.data;
                fio = clients[countFio].people_initials;
                id_acc = clients[countFio].id_acc;
                datePayment = new Date(clients[countFio].packages[packageLen].date_start).toLocaleDateString();
                payment = clients[countFio].packages[packageLen].price;
                for (const d of db) {
                    if (id_acc == d.id_acc) {
                        mosreg = d.mosreg;
                        certificateDate = d.certificateDate;
                        contractDate = d.contractDate;
                        return (
                            <a
                                onClick={() => linkFioChacnge(fio, id_acc, mosreg, datePayment, payment, certificateDate, contractDate)}
                                href={`http://${url}/#/client-detail/${id_acc}?identifier=${identifier}&id_sp=${clients[countFio].packages[packageLen].id_sp}`}
                                style={{ 'text-decoration': 'none', color: 'black' }}
                            >
                                {fio}
                            </a>
                        );
                    }
                }
                mosreg = 0;
                certificateDate = undefined;
                contractDate = 0;
                return (
                    <a
                        onClick={() => linkFioChacnge(fio, id_acc, mosreg, datePayment, payment, certificateDate, contractDate)}
                        href={`http://${url}/#/client-detail/${id_acc}?identifier=${identifier}&id_sp=${clients[countFio].packages[packageLen].id_sp}`}
                        style={{ 'text-decoration': 'none', color: 'black' }}
                    >
                        {fio}
                    </a>
                );
            } catch (e) {
                let a = e;
            }
        }
    };

    let count = -1;
    const mosregCheckBox = () => {
        let fio;
        let id_acc = 0;
        let datePayment;
        let payment;
        let certificateDate;
        let contractDate;
        let db = [];
        let packageLen = 0;
        count++;
        if (clients.length > 0) {
            db = checkMos.data;
            try {
                packageLen = clients[count].packages.length - 1;
                fio = clients[count].people_initials;
                id_acc = clients[count].id_acc;
                datePayment = new Date(clients[count].packages[packageLen].date_start).toLocaleDateString();
                payment = clients[count].packages[packageLen].price;
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
                                    checkHandler(fio, id_acc, datePayment, payment, certificateDate, contractDate);
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
                            checkHandler(fio, id_acc, datePayment, payment, certificateDate, contractDate);
                            location.reload();
                        }}
                        defaultChecked={isChecked}
                        id={toString(id_acc)}
                        size="small"
                    />
                );
            } catch (e) {
                let a = e;
            }
        }
    };

    const loadPostClient = async (fio, id_acc, check, datePayment, payment, certificateDate, contractDate) => {
        let pMosReg = '';
        let mosreg;
        let cont;
        if (check == true) {
            mosreg = 1;
        } else {
            mosreg = 0;
        }
        if (contractDate == true) {
            cont = 1;
        } else {
            cont = 0;
        }
        pMosReg = `{"fio":"${fio}","id_acc":"${id_acc}","mosreg":"${mosreg}","datePayment":"${datePayment}","payment":"${payment}","certificateDate":"${certificateDate}","contractDate":"${cont}"}`;
        await expressController.postClient(pMosReg);
    };

    const checkHandler = (fio, id_acc, datePayment, payment, certificateDate, contractDate) => {
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
        loadPostClient(fio, id_acc, isChecked, datePayment, payment, certificateDate, contractDate);
    };

    useEffect(() => {
        setColumns([]);
        setTimeout(() => {
            if (daysInMonth == 28) {
                setColumns([
                    {
                        field: 'number_people',
                        label: '№'
                    },
                    {
                        field: 'people_initials',
                        label: 'ФИО',
                        render: () => linkFio()
                    },
                    {
                        field: 'id_acc',
                        label: 'МосРег',
                        render: () => mosregCheckBox()
                    },
                    ...c,
                    {
                        label: 1,
                        field: 'day1',
                        render: (recordData) => checkbox1(recordData, 1)
                    },
                    {
                        label: 2,
                        field: 'day2',
                        render: (recordData) => checkbox2(recordData, 2)
                    },
                    {
                        label: 3,
                        field: 'day3',
                        render: (recordData) => checkbox3(recordData, 3)
                    },
                    {
                        label: 4,
                        field: 'day4',
                        render: (recordData) => checkbox4(recordData, 4)
                    },
                    {
                        label: 5,
                        field: 'day5',
                        render: (recordData) => checkbox5(recordData, 5)
                    },
                    {
                        label: 6,
                        field: 'day6',
                        render: (recordData) => checkbox6(recordData, 6)
                    },
                    {
                        label: 7,
                        field: 'day7',
                        render: (recordData) => checkbox7(recordData, 7)
                    },
                    {
                        label: 8,
                        field: 'day8',
                        render: (recordData) => checkbox8(recordData, 8)
                    },
                    {
                        label: 9,
                        field: 'day9',
                        render: (recordData) => checkbox9(recordData, 9)
                    },
                    {
                        label: 10,
                        field: 'day10',
                        render: (recordData) => checkbox10(recordData, 10)
                    },
                    {
                        label: 11,
                        field: 'day11',
                        render: (recordData) => checkbox11(recordData, 11)
                    },
                    {
                        label: 12,
                        field: 'day12',
                        render: (recordData) => checkbox12(recordData, 12)
                    },
                    {
                        label: 13,
                        field: 'day13',
                        render: (recordData) => checkbox13(recordData, 13)
                    },
                    {
                        label: 14,
                        field: 'day14',
                        render: (recordData) => checkbox14(recordData, 14)
                    },
                    {
                        label: 15,
                        field: 'day15',
                        render: (recordData) => checkbox15(recordData, 15)
                    },
                    {
                        label: 16,
                        field: 'day16',
                        render: (recordData) => checkbox16(recordData, 16)
                    },
                    {
                        label: 17,
                        field: 'day17',
                        render: (recordData) => checkbox17(recordData, 17)
                    },
                    {
                        label: 18,
                        field: 'day18',
                        render: (recordData) => checkbox18(recordData, 18)
                    },
                    {
                        label: 19,
                        field: 'day19',
                        render: (recordData) => checkbox19(recordData, 19)
                    },
                    {
                        label: 20,
                        field: 'day20',
                        render: (recordData) => checkbox20(recordData, 20)
                    },
                    {
                        label: 21,
                        field: 'day21',
                        render: (recordData) => checkbox21(recordData, 21)
                    },
                    {
                        label: 22,
                        field: 'day22',
                        render: (recordData) => checkbox22(recordData, 22)
                    },
                    {
                        label: 23,
                        field: 'day23',
                        render: (recordData) => checkbox23(recordData, 23)
                    },
                    {
                        label: 24,
                        field: 'day24',
                        render: (recordData) => checkbox24(recordData, 24)
                    },
                    {
                        label: 25,
                        field: 'day25',
                        render: (recordData) => checkbox25(recordData, 25)
                    },
                    {
                        label: 26,
                        field: 'day26',
                        render: (recordData) => checkbox26(recordData, 26)
                    },
                    {
                        label: 27,
                        field: 'day27',
                        render: (recordData) => checkbox27(recordData, 27)
                    },
                    {
                        label: 28,
                        field: 'day28',
                        render: (recordData) => checkbox28(recordData, 28)
                    }
                ]);
            } else if (daysInMonth == 29) {
                setColumns([
                    {
                        field: 'number_people',
                        label: '№'
                    },
                    {
                        field: 'people_initials',
                        label: 'ФИО',
                        render: () => linkFio()
                    },
                    {
                        field: 'id_acc',
                        label: 'МосРег',
                        render: () => mosregCheckBox()
                    },
                    ...c,
                    {
                        label: 1,
                        field: 'day1',
                        render: (recordData) => checkbox1(recordData, 1)
                    },
                    {
                        label: 2,
                        field: 'day2',
                        render: (recordData) => checkbox2(recordData, 2)
                    },
                    {
                        label: 3,
                        field: 'day3',
                        render: (recordData) => checkbox3(recordData, 3)
                    },
                    {
                        label: 4,
                        field: 'day4',
                        render: (recordData) => checkbox4(recordData, 4)
                    },
                    {
                        label: 5,
                        field: 'day5',
                        render: (recordData) => checkbox5(recordData, 5)
                    },
                    {
                        label: 6,
                        field: 'day6',
                        render: (recordData) => checkbox6(recordData, 6)
                    },
                    {
                        label: 7,
                        field: 'day7',
                        render: (recordData) => checkbox7(recordData, 7)
                    },
                    {
                        label: 8,
                        field: 'day8',
                        render: (recordData) => checkbox8(recordData, 8)
                    },
                    {
                        label: 9,
                        field: 'day9',
                        render: (recordData) => checkbox9(recordData, 9)
                    },
                    {
                        label: 10,
                        field: 'day10',
                        render: (recordData) => checkbox10(recordData, 10)
                    },
                    {
                        label: 11,
                        field: 'day11',
                        render: (recordData) => checkbox11(recordData, 11)
                    },
                    {
                        label: 12,
                        field: 'day12',
                        render: (recordData) => checkbox12(recordData, 12)
                    },
                    {
                        label: 13,
                        field: 'day13',
                        render: (recordData) => checkbox13(recordData, 13)
                    },
                    {
                        label: 14,
                        field: 'day14',
                        render: (recordData) => checkbox14(recordData, 14)
                    },
                    {
                        label: 15,
                        field: 'day15',
                        render: (recordData) => checkbox15(recordData, 15)
                    },
                    {
                        label: 16,
                        field: 'day16',
                        render: (recordData) => checkbox16(recordData, 16)
                    },
                    {
                        label: 17,
                        field: 'day17',
                        render: (recordData) => checkbox17(recordData, 17)
                    },
                    {
                        label: 18,
                        field: 'day18',
                        render: (recordData) => checkbox18(recordData, 18)
                    },
                    {
                        label: 19,
                        field: 'day19',
                        render: (recordData) => checkbox19(recordData, 19)
                    },
                    {
                        label: 20,
                        field: 'day20',
                        render: (recordData) => checkbox20(recordData, 20)
                    },
                    {
                        label: 21,
                        field: 'day21',
                        render: (recordData) => checkbox21(recordData, 21)
                    },
                    {
                        label: 22,
                        field: 'day22',
                        render: (recordData) => checkbox22(recordData, 22)
                    },
                    {
                        label: 23,
                        field: 'day23',
                        render: (recordData) => checkbox23(recordData, 23)
                    },
                    {
                        label: 24,
                        field: 'day24',
                        render: (recordData) => checkbox24(recordData, 24)
                    },
                    {
                        label: 25,
                        field: 'day25',
                        render: (recordData) => checkbox25(recordData, 25)
                    },
                    {
                        label: 26,
                        field: 'day26',
                        render: (recordData) => checkbox26(recordData, 26)
                    },
                    {
                        label: 27,
                        field: 'day27',
                        render: (recordData) => checkbox27(recordData, 27)
                    },
                    {
                        label: 28,
                        field: 'day28',
                        render: (recordData) => checkbox28(recordData, 28)
                    },
                    {
                        label: 29,
                        field: 'day29',
                        render: (recordData) => checkbox29(recordData, 29)
                    }
                ]);
            } else if (daysInMonth == 30) {
                setColumns([
                    {
                        field: 'number_people',
                        label: '№'
                    },
                    {
                        field: 'people_initials',
                        label: 'ФИО',
                        render: () => linkFio()
                    },
                    {
                        field: 'id_acc',
                        label: 'МосРег',
                        render: () => mosregCheckBox()
                    },
                    ...c,
                    {
                        label: 1,
                        field: 'day1',
                        render: (recordData) => checkbox1(recordData, 1)
                    },
                    {
                        label: 2,
                        field: 'day2',
                        render: (recordData) => checkbox2(recordData, 2)
                    },
                    {
                        label: 3,
                        field: 'day3',
                        render: (recordData) => checkbox3(recordData, 3)
                    },
                    {
                        label: 4,
                        field: 'day4',
                        render: (recordData) => checkbox4(recordData, 4)
                    },
                    {
                        label: 5,
                        field: 'day5',
                        render: (recordData) => checkbox5(recordData, 5)
                    },
                    {
                        label: 6,
                        field: 'day6',
                        render: (recordData) => checkbox6(recordData, 6)
                    },
                    {
                        label: 7,
                        field: 'day7',
                        render: (recordData) => checkbox7(recordData, 7)
                    },
                    {
                        label: 8,
                        field: 'day8',
                        render: (recordData) => checkbox8(recordData, 8)
                    },
                    {
                        label: 9,
                        field: 'day9',
                        render: (recordData) => checkbox9(recordData, 9)
                    },
                    {
                        label: 10,
                        field: 'day10',
                        render: (recordData) => checkbox10(recordData, 10)
                    },
                    {
                        label: 11,
                        field: 'day11',
                        render: (recordData) => checkbox11(recordData, 11)
                    },
                    {
                        label: 12,
                        field: 'day12',
                        render: (recordData) => checkbox12(recordData, 12)
                    },
                    {
                        label: 13,
                        field: 'day13',
                        render: (recordData) => checkbox13(recordData, 13)
                    },
                    {
                        label: 14,
                        field: 'day14',
                        render: (recordData) => checkbox14(recordData, 14)
                    },
                    {
                        label: 15,
                        field: 'day15',
                        render: (recordData) => checkbox15(recordData, 15)
                    },
                    {
                        label: 16,
                        field: 'day16',
                        render: (recordData) => checkbox16(recordData, 16)
                    },
                    {
                        label: 17,
                        field: 'day17',
                        render: (recordData) => checkbox17(recordData, 17)
                    },
                    {
                        label: 18,
                        field: 'day18',
                        render: (recordData) => checkbox18(recordData, 18)
                    },
                    {
                        label: 19,
                        field: 'day19',
                        render: (recordData) => checkbox19(recordData, 19)
                    },
                    {
                        label: 20,
                        field: 'day20',
                        render: (recordData) => checkbox20(recordData, 20)
                    },
                    {
                        label: 21,
                        field: 'day21',
                        render: (recordData) => checkbox21(recordData, 21)
                    },
                    {
                        label: 22,
                        field: 'day22',
                        render: (recordData) => checkbox22(recordData, 22)
                    },
                    {
                        label: 23,
                        field: 'day23',
                        render: (recordData) => checkbox23(recordData, 23)
                    },
                    {
                        label: 24,
                        field: 'day24',
                        render: (recordData) => checkbox24(recordData, 24)
                    },
                    {
                        label: 25,
                        field: 'day25',
                        render: (recordData) => checkbox25(recordData, 25)
                    },
                    {
                        label: 26,
                        field: 'day26',
                        render: (recordData) => checkbox26(recordData, 26)
                    },
                    {
                        label: 27,
                        field: 'day27',
                        render: (recordData) => checkbox27(recordData, 27)
                    },
                    {
                        label: 28,
                        field: 'day28',
                        render: (recordData) => checkbox28(recordData, 28)
                    },
                    {
                        label: 29,
                        field: 'day29',
                        render: (recordData) => checkbox29(recordData, 29)
                    },
                    {
                        label: 30,
                        field: 'day30',
                        render: (recordData) => checkbox30(recordData, 30)
                    }
                ]);
            } else if (daysInMonth == 31) {
                setColumns([
                    {
                        field: 'number_people',
                        label: '№'
                    },
                    {
                        field: 'people_initials',
                        label: 'ФИО',
                        render: () => linkFio()
                    },
                    {
                        field: 'id_acc',
                        label: 'МосРег',
                        render: () => mosregCheckBox()
                    },
                    ...c,
                    {
                        label: 1,
                        field: 'day1',
                        render: (recordData) => checkbox1(recordData, 1)
                    },
                    {
                        label: 2,
                        field: 'day2',
                        render: (recordData) => checkbox2(recordData, 2)
                    },
                    {
                        label: 3,
                        field: 'day3',
                        render: (recordData) => checkbox3(recordData, 3)
                    },
                    {
                        label: 4,
                        field: 'day4',
                        render: (recordData) => checkbox4(recordData, 4)
                    },
                    {
                        label: 5,
                        field: 'day5',
                        render: (recordData) => checkbox5(recordData, 5)
                    },
                    {
                        label: 6,
                        field: 'day6',
                        render: (recordData) => checkbox6(recordData, 6)
                    },
                    {
                        label: 7,
                        field: 'day7',
                        render: (recordData) => checkbox7(recordData, 7)
                    },
                    {
                        label: 8,
                        field: 'day8',
                        render: (recordData) => checkbox8(recordData, 8)
                    },
                    {
                        label: 9,
                        field: 'day9',
                        render: (recordData) => checkbox9(recordData, 9)
                    },
                    {
                        label: 10,
                        field: 'day10',
                        render: (recordData) => checkbox10(recordData, 10)
                    },
                    {
                        label: 11,
                        field: 'day11',
                        render: (recordData) => checkbox11(recordData, 11)
                    },
                    {
                        label: 12,
                        field: 'day12',
                        render: (recordData) => checkbox12(recordData, 12)
                    },
                    {
                        label: 13,
                        field: 'day13',
                        render: (recordData) => checkbox13(recordData, 13)
                    },
                    {
                        label: 14,
                        field: 'day14',
                        render: (recordData) => checkbox14(recordData, 14)
                    },
                    {
                        label: 15,
                        field: 'day15',
                        render: (recordData) => checkbox15(recordData, 15)
                    },
                    {
                        label: 16,
                        field: 'day16',
                        render: (recordData) => checkbox16(recordData, 16)
                    },
                    {
                        label: 17,
                        field: 'day17',
                        render: (recordData) => checkbox17(recordData, 17)
                    },
                    {
                        label: 18,
                        field: 'day18',
                        render: (recordData) => checkbox18(recordData, 18)
                    },
                    {
                        label: 19,
                        field: 'day19',
                        render: (recordData) => checkbox19(recordData, 19)
                    },
                    {
                        label: 20,
                        field: 'day20',
                        render: (recordData) => checkbox20(recordData, 20)
                    },
                    {
                        label: 21,
                        field: 'day21',
                        render: (recordData) => checkbox21(recordData, 21)
                    },
                    {
                        label: 22,
                        field: 'day22',
                        render: (recordData) => checkbox22(recordData, 22)
                    },
                    {
                        label: 23,
                        field: 'day23',
                        render: (recordData) => checkbox23(recordData, 23)
                    },
                    {
                        label: 24,
                        field: 'day24',
                        render: (recordData) => checkbox24(recordData, 24)
                    },
                    {
                        label: 25,
                        field: 'day25',
                        render: (recordData) => checkbox25(recordData, 25)
                    },
                    {
                        label: 26,
                        field: 'day26',
                        render: (recordData) => checkbox26(recordData, 26)
                    },
                    {
                        label: 27,
                        field: 'day27',
                        render: (recordData) => checkbox27(recordData, 27)
                    },
                    {
                        label: 28,
                        field: 'day28',
                        render: (recordData) => checkbox28(recordData, 28)
                    },
                    {
                        label: 29,
                        field: 'day29',
                        render: (recordData) => checkbox29(recordData, 29)
                    },
                    {
                        label: 30,
                        field: 'day30',
                        render: (recordData) => checkbox30(recordData, 30)
                    },
                    {
                        label: 31,
                        field: 'day31',
                        render: (recordData) => checkbox31(recordData, 31)
                    }
                ]);
            }
        }, 0);
    }, [selectedDate, daysInMonth, visits]);

    return (
        <MainCard id="Schet" title={`Группа ${id}`}>
            <Grid container spacing={1}>
                <Grid item xs={11}>
                    <DatePicker
                        views={['year', 'month']}
                        label="Месяц, год"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        renderInput={(params) => <TextField {...params} helperText={null} />}
                        inputFormat={'MM/yyyy'}
                        openTo={'month'}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Button
                        href={`/#/season-tickets?selectedDate=${selectedDate}&id=${id}`}
                        target={'_blank'}
                        variant="contained"
                        size="large"
                    >
                        Абонементы
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <GroupClientTable columns={columns} content={clients} keyProp={'id_prs'} />
                </Grid>
            </Grid>
        </MainCard>
    );
};

GroupClients.propTypes = {};

export default GroupClients;
