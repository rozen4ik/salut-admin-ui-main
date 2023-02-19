import { InputLabel, Box, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, Select, TextField, Button } from '@mui/material';
import MainCard from '../../components/MainCard';
import CTable from '../../components/CTable';
import { useNavigate, useParams } from 'react-router';
import React, { useEffect, useState } from 'react';
import controller from '../../api/controller';
import { DatePicker } from '@mui/x-date-pickers';
import AdapterDayjs from '@mui/lab/AdapterDayjs';

const AddClient = () => {
    const [rojDate, setRojDate] = useState(new Date());
    const [medSpravkDate, setMedSpravkDate] = useState(new Date());
    const [sType, handleChange] = useState();
    const [sMale, setMale] = useState();
    const [sViewSport, setViewSport] = useState();
    const [sInstr, setInstr] = useState();
    const [sGroup, setGroup] = useState();
    const [sRod, setRod] = useState();
    const [rodDate, setRodDate] = useState(new Date());
    const [createDate, setCreateDate] = useState(new Date());

    return (
        <MainCard title="Карточка добавления клиента">
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <h4>Основная информация</h4>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth id="lastName" label="Фамилия" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth id="firstName" label="Имя" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth id="otchName" label="Отчество" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <DatePicker
                                views={['day', 'year', 'month']}
                                label="Дата рождения"
                                value={rojDate}
                                onChange={setRojDate}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                                inputFormat={'dd/MM/yyyy'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                        <TextField fullWidth id="phone" label="Телефон" variant="outlined" />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel control={<Checkbox id="checkRodPhone" />} label="Телефон родителя" />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField id="svidRojOrPassport" fullWidth label="Св. о рождении или паспорт" variant="outlined" />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField id="medPolic" fullWidth label="Медицинский полис" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField id="addLive" fullWidth label="Адрес проживания" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField id="comm" fullWidth label="Комментарий" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="selectTypeLabel">Выберите тип</InputLabel>
                            <Select labelId="selectTypeLabel" id="selectType" value={sType} label="Выберите тип" onChange={handleChange}>
                                <MenuItem value={0}>Взрослый</MenuItem>
                                <MenuItem value={1}>Ребенок</MenuItem>
                                <MenuItem value={2}>Пенсионер</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="selectMaleLabel">Выберите пол</InputLabel>
                            <Select labelId="selectMaleLabel" id="selectMale" value={sMale} label="Выберите пол" onChange={setMale}>
                                <MenuItem value={0}>Мужской</MenuItem>
                                <MenuItem value={1}>Женский</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Медицинская справка</h4>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <DatePicker
                                views={['day', 'year', 'month']}
                                label="Дата выдачи"
                                value={medSpravkDate}
                                onChange={setMedSpravkDate}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                                inputFormat={'dd/MM/yyyy'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={8}></Grid>
                    <Grid item xs={12}>
                        <h4>Спорт и группа</h4>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="selectViewSportLabel">Выберите вид спорта</InputLabel>
                            <Select
                                labelId="selectViewSportLabel"
                                id="selectViewSport"
                                value={sViewSport}
                                label="Выберите вид спорта"
                                onChange={setViewSport}
                            >
                                <MenuItem value={0}>...</MenuItem>
                                <MenuItem value={1}>...</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="selectInstrLabel">Выберите тренера</InputLabel>
                            <Select labelId="selectInstrLabel" id="selectInstr" value={sInstr} label="Выберите тренера" onChange={setInstr}>
                                <MenuItem value={0}>...</MenuItem>
                                <MenuItem value={1}>...</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="selectGroupLabel">Выберите группу</InputLabel>
                            <Select labelId="selectGroupLabel" id="selectGroup" value={sGroup} label="Выберите группу" onChange={setGroup}>
                                <MenuItem value={0}>...</MenuItem>
                                <MenuItem value={1}>...</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Родители</h4>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="selectRodLabel">Родитель</InputLabel>
                            <Select labelId="selectRodLabel" id="selectRod" value={sRod} label="Родитель" onChange={setRod}>
                                <MenuItem value={0}>Папа</MenuItem>
                                <MenuItem value={1}>Мама</MenuItem>
                                <MenuItem value={2}>Сестра</MenuItem>
                                <MenuItem value={3}>Брат</MenuItem>
                                <MenuItem value={4}>Бабушка</MenuItem>
                                <MenuItem value={5}>Дедушка</MenuItem>
                                <MenuItem value={6}>Тётя</MenuItem>
                                <MenuItem value={7}>Дядя</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={8}></Grid>
                    <Grid item xs={4}>
                        <TextField id="fioRod" fullWidth label="ФИО родителя" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <DatePicker
                                views={['day', 'year', 'month']}
                                label="Дата рождения родителя"
                                value={rodDate}
                                onChange={setRodDate}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                                inputFormat={'dd/MM/yyyy'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={4}>
                        <TextField id="osnPhone" fullWidth label="Основной телефон" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id="dopPhone" fullWidth label="Доп. телефон" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id="cityPhone" fullWidth label="Городской телефон" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <h4>Интересы</h4>
                    </Grid>
                    <Grid item xs={12}>
                        <h5>Потенциальные виды спорта</h5>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControlLabel control={<Checkbox id="active" defaultChecked />} label="Активен" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControlLabel control={<Checkbox id="delete" />} label="Отправить на удаление" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <DatePicker
                                views={['day', 'year', 'month']}
                                label="Дата создания"
                                value={createDate}
                                onChange={setCreateDate}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                                inputFormat={'dd/MM/yyyy'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained">Сохранить</Button>
                    </Grid>
                </Grid>
            </Box>
        </MainCard>
    );
};

export default AddClient;
