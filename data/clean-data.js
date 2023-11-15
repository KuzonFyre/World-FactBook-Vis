import { createReadStream, writeFileSync } from 'fs';
import csv from 'csv-parser';

let columns = [];
createReadStream('columnKey.csv')
  .pipe(csv())
  .on('data', (row) => {
    columns.push(Object.keys(row));
  })
  .on('end', () => {
    createReadStream('countries.csv')
      .pipe(csv())
      .on('data', (row) => {
        let cleanRow = {};
        columns.forEach(column => {
          if(row[column]) cleanRow[column] = row[column];
        });
        cleanCountries.push(cleanRow);
      })
      .on('end', () => {
        let cleanData = cleanCountries.map(JSON.stringify).join('\n');
        writeFileSync('clean-countries.csv', cleanData);
      });
  });