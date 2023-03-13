import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

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
const SeasonTickets = () => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.Text}>Секция 1</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.Text}>Секция 2</Text>
            </View>
        </Page>
    </Document>
);

export default SeasonTickets;
