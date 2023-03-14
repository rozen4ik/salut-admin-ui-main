import { Page, Text, View, Document, StyleSheet, Font, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useSearchParams } from 'react-router-dom';
import MainCard from '../../components/MainCard';
import { Grid } from '@mui/material';

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
        fontFamily: 'Roboto'
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
    const clients = searchParams.get('clients');

    return (
        <MainCard title={`Абонементы на группу ${id_gr}`}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PDFViewer width={'100%'} height={1080}>
                        <Document>
                            <Page size="A4" style={styles.page}>
                                <View style={styles.section}>
                                    <Text style={styles.Text}>{clients}</Text>
                                </View>
                                <View style={styles.section}>
                                    <Text style={styles.Text}>Секция 2</Text>
                                </View>
                            </Page>
                        </Document>
                    </PDFViewer>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default SeasonTickets;
