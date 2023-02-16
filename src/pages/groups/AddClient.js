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

    return (
        <MainCard title="Карточка добавления клиента">
            <Box>
                <Grid container spacing={2}>
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
                    <Grid item xs={2}>
                        <TextField fullWidth id="phone" label="Телефон" variant="outlined" />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel control={<Checkbox />} label="Телефон родителя" />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField id="svidRojOrPassport" fullWidth label="Св. о рождении или паспорт" variant="outlined" />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField id="medPolic" fullWidth label="Медицинский полис" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <DatePicker
                            views={['day', 'year', 'month']}
                            label="Дата рождения"
                            value={rojDate}
                            onChange={setRojDate}
                            renderInput={(params) => <TextField {...params} helperText={null} />}
                            inputFormat={'dd/MM/yyyy'}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField id="addLive" fullWidth label="Св. о рождении или паспорт" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField id="medPolic" fullWidth label="Медицинский полис" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="selectTypeLabel">Выберите тип</InputLabel>
                            <Select labelId="selectTypeLabel" id="selectType" value={sType} label="Выберите тип" onChange={handleChange}>
                                <MenuItem value={0}>...</MenuItem>
                                <MenuItem value={1}>...</MenuItem>
                                <MenuItem value={2}>...</MenuItem>
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
                    <Grid item xs={12}>
                        <DatePicker
                            views={['day', 'year', 'month']}
                            label="Дата выдачи"
                            value={medSpravkDate}
                            onChange={setMedSpravkDate}
                            renderInput={(params) => <TextField {...params} helperText={null} />}
                            inputFormat={'dd/MM/yyyy'}
                        />
                    </Grid>
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
                        <Button variant="contained">Сохранить</Button>
                    </Grid>
                </Grid>
            </Box>
        </MainCard>
    );
};

export default AddClient;
