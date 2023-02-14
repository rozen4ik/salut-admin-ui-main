import React, { useEffect, useState } from 'react';
import controller from '../../api/controller';
import MainCard from '../../components/MainCard';
import { Box, Button, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const InstrReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportInfo, setReportInfo] = useState();

    async function loadData() {
        if (isLoading) return;
        try {
            setIsLoading(true);
            const salesReportInfo = await controller.getRentSalesReport(startDate, endDate);
            setReportInfo(salesReportInfo);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <MainCard title="Продажи по аренде">
            <Box sx={{ display: 'inline' }}>
                <Box sx={{ display: 'inline' }}>
                    <DatePicker
                        views={['day', 'year', 'month']}
                        label="Дата начала"
                        value={startDate}
                        onChange={setStartDate}
                        renderInput={(params) => <TextField {...params} helperText={null} />}
                        inputFormat={'dd/MM/yyyy'}
                    />
                </Box>
                <Box sx={{ display: 'inline' }} ml={1}>
                    <DatePicker
                        views={['day', 'year', 'month']}
                        label="Дата окончания"
                        value={endDate}
                        onChange={setEndDate}
                        renderInput={(params) => <TextField {...params} helperText={null} />}
                        inputFormat={'dd/MM/yyyy'}
                    />
                </Box>
                <Box ml={3} sx={{ display: 'inline' }}>
                    <Button variant="contained" ml={3} onClick={loadData} disabled={isLoading}>
                        Загрузить отчет
                    </Button>
                </Box>
            </Box>
            <div>{isLoading && <div>Загрузка...</div>}</div>
            <div>{reportInfo && <div dangerouslySetInnerHTML={{ __html: reportInfo?.raw_html }} />}</div>
        </MainCard>
    );
};

export default InstrReport;
