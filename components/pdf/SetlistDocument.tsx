import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { SetlistItem } from '@/types'

interface SetlistDocumentProps {
  name: string
  date: string
  venue: string
  setlist: SetlistItem[]
  eventTitle: string
  logoUrl?: string
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
  },
  container: {
    backgroundColor: 'black',
    padding: 30,
    height: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 0,
  },
  logo: {
    width: 'auto',
    height: 50,
    objectFit: 'contain',
  },
  bandName: {
    fontSize: 40,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Zen Kaku Gothic New',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
    fontFamily: 'Zen Kaku Gothic New',
  },
  eventTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 0,
    color: 'white',
    fontFamily: 'Zen Kaku Gothic New',
  },
  venue: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    color: 'white',
    fontFamily: 'Zen Kaku Gothic New',
    fontWeight: 'bold',
  },
  songItem: {
    fontSize: 30,
    marginBottom: 15,
    color: 'white',
    fontFamily: 'Zen Kaku Gothic New',
    fontWeight: 'bold',
  },
  mcItem: {
    fontSize: 30,
    marginBottom: 15,
    color: 'white',
    padding: 5,
    fontFamily: 'Zen Kaku Gothic New',
    fontWeight: 'normal',
  },
})

export const SetlistDocument: React.FC<SetlistDocumentProps> = ({
  name,
  date,
  venue,
  setlist,
  eventTitle,
  logoUrl,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} />
          ) : (
            <Text style={styles.bandName}>{name}</Text>
          )}
        </View>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.eventTitle}>{eventTitle}</Text>
        <Text style={styles.venue}>{venue}</Text>
        {setlist.map((item) => (
          <Text
            key={item.id}
            style={item.type === 'mc' ? styles.mcItem : styles.songItem}
          >
            {item.type === 'song'
              ? `${item.order}. ${item.content}`
              : `-- MC: ${item.content} --`}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
)

