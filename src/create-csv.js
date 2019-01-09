const fs = require('fs');
const rimraf = require('rimraf');

//get the state names we want to run this scrapper for
const statesRaw = fs.readFileSync('./src/state-names.json');
const stateNames = JSON.parse(statesRaw);
//setup some string constants for use later
const SINGLE = 'single';
const MARRIED_FILING_JOINTLY = 'married';
const MARRIED_FILING_SEPARATELY = 'married_separately';
const HEAD_OF_HOUSEHOLD = 'head_of_household';

const INCOME_TAX_BRACKETS = 'income_tax_brackets';

const INCOMETAXPRO_FILING_STATUSES_MAP = {};
INCOMETAXPRO_FILING_STATUSES_MAP[SINGLE] = 'Single';
INCOMETAXPRO_FILING_STATUSES_MAP[MARRIED_FILING_JOINTLY] = 'Married Filing Jointly';
INCOMETAXPRO_FILING_STATUSES_MAP[MARRIED_FILING_SEPARATELY] = 'Married Filing Separately';
INCOMETAXPRO_FILING_STATUSES_MAP[HEAD_OF_HOUSEHOLD] = 'Head of Household';

const OUTPUT_FILE = 'output.csv';


function capitalCase(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function writeOutputToDisk(output) {
    let csvOutput = '';

    Object.keys(output).forEach(function(stateName) {
        csvOutput += capitalCase(stateName) + '\n';
        Object.keys(output[stateName]).forEach(function(filingStatus) {
            csvOutput += INCOMETAXPRO_FILING_STATUSES_MAP[filingStatus] + '\n';
            csvOutput += 'Bracket, Marginal Rate\n';
            if (!output[stateName][filingStatus][INCOME_TAX_BRACKETS]) {
                csvOutput += `No state income tax\n`;
                return;
            }
            output[stateName][filingStatus][INCOME_TAX_BRACKETS].forEach(function(bracketData) {
                csvOutput += `${bracketData.bracket},${bracketData.marginal_rate}\n`;
            })
        })
        csvOutput += '\n';
    })

    fs.writeFileSync(`./${OUTPUT_FILE}`, csvOutput);
}

function getOutputForState(stateName) {
    const outputRaw = fs.readFileSync(`./output/${stateName}.json`);
    const output = JSON.parse(outputRaw);
    return output;
}

(async () => {
    rimraf.sync(OUTPUT_FILE);
    const output = {};
    let stateName;
    for (let i=0; i<stateNames.length; i++) {
        stateName = stateNames[i];
        const stateOutput = getOutputForState(stateName[1]);
        output[stateName[1]] = {};
        output[stateName[1]][SINGLE] = {};
        output[stateName[1]][MARRIED_FILING_JOINTLY] = {};
        output[stateName[1]][MARRIED_FILING_SEPARATELY] = {};
        output[stateName[1]][HEAD_OF_HOUSEHOLD] = {};
        output[stateName[1]][SINGLE][INCOME_TAX_BRACKETS] = stateOutput[SINGLE][INCOME_TAX_BRACKETS];
        output[stateName[1]][MARRIED_FILING_JOINTLY][INCOME_TAX_BRACKETS] = stateOutput[MARRIED_FILING_JOINTLY][INCOME_TAX_BRACKETS];
        output[stateName[1]][MARRIED_FILING_SEPARATELY][INCOME_TAX_BRACKETS] = stateOutput[MARRIED_FILING_SEPARATELY][INCOME_TAX_BRACKETS];
        output[stateName[1]][HEAD_OF_HOUSEHOLD][INCOME_TAX_BRACKETS] = stateOutput[HEAD_OF_HOUSEHOLD][INCOME_TAX_BRACKETS];
    }
    writeOutputToDisk(output);
})();