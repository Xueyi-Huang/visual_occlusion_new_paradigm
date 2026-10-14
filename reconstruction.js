const fs = require('fs');
const seedrandom = require('seedrandom');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputFilePath = 'data/v10_within_sub_all_subjects_data.csv';
const outputFilePath = 'data/v10_within_sub_all_subjects_data_with_conditions.csv';

let data = [];

// Step 1: Read the CSV file
fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => data.push(row))
    .on('end', () => {
        console.log('CSV file successfully read.');
        processTrials();
    });

// Step 2: Process trials
function processTrials() {
    data.forEach((row) => {
        const subject_id = row['subject_id'];
        const trial_num = parseInt(row['trial_num'], 10);

        const rng = seedrandom(subject_id);
        let trials = [];
        for (let blockNum = 1; blockNum <= 4; blockNum++) {
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= 4; j++) {
                    trials.push(blockNum);
                }
            }
        }
        trials = trials.sort(() => rng() - 0.5);
        row['trial_condition'] = trials[trial_num - 1];
    });

    writeUpdatedCSV();
}

// Step 3: Write updated CSV file
function writeUpdatedCSV() {
    const csvWriter = createCsvWriter({
        path: outputFilePath,
        header: Object.keys(data[0]).map((key) => ({ id: key, title: key })), // Dynamically map headers
    });

    csvWriter
        .writeRecords(data)
        .then(() => console.log(`Updated CSV file written to ${outputFilePath}`))
        .catch((err) => console.error('Error writing CSV:', err));
}
