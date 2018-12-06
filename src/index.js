const fetch = require('node-fetch');
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

const OUTPUT_DIRECTORY = 'output';

function writeOutputToDisk(stateName, output) {
    fs.writeFileSync(`./output/${stateName}.json`, JSON.stringify(output, null, 4));
}

async function getHtmlForState(stateName) {
        return fetch(`https://www.incometaxpro.net/tax-rates/${stateName}.htm`)
            .then(res => res.text());
} 

// this matches the taxee structure
// we will only be trying to update the "income_tax_brackets" array
//
// Note that the objects within "income_tax_brackets" should be of this form:
//  {
//    "bracket": <Number>,
//     "marginal_rate": <Number>
//  }
//
function getBareOutputStructure() {
    return {
        "single": {
            "specialtaxes": [],
            "deductions": [],
            "credits": [],
            "annotations": [],
            "income_tax_brackets": []
        },
        "married": {
            "specialtaxes": [],
            "deductions": [],
            "credits": [],
            "annotations": [],
            "income_tax_brackets": []
        },
        "married_separately": {
            "specialtaxes": [],
            "deductions": [],
            "credits": [],
            "annotations": [],
            "income_tax_brackets": []
        },
        "head_of_household": {
            "specialtaxes": [],
            "deductions": [],
            "credits": [],
            "annotations": [],
            "income_tax_brackets": []
        }
    }
}


function getIncomeTaxBracketsForFilingStatus(filingStatusName, html) {
    const brackets = []
    // Start of parsing magic
    debugger;
    //End of parsing magic
    return brackets;
}

(async () => {
    rimraf.sync(OUTPUT_DIRECTORY);
    if (!fs.existsSync(OUTPUT_DIRECTORY)){
        fs.mkdirSync(OUTPUT_DIRECTORY);
    }
    let stateName;
    for (let i=0; i<stateNames.length; i++) {
        stateName = stateNames[i];
        const html = await getHtmlForState(stateName);
        const output = getBareOutputStructure();
        output[SINGLE][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(INCOMETAXPRO_FILING_STATUSES_MAP[SINGLE], html);
        output[MARRIED_FILING_JOINTLY][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(INCOMETAXPRO_FILING_STATUSES_MAP[MARRIED_FILING_JOINTLY], html);
        output[MARRIED_FILING_SEPARATELY][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(INCOMETAXPRO_FILING_STATUSES_MAP[MARRIED_FILING_SEPARATELY], html);
        output[HEAD_OF_HOUSEHOLD][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(INCOMETAXPRO_FILING_STATUSES_MAP[HEAD_OF_HOUSEHOLD], html);
        writeOutputToDisk(stateName, output);
    }

})();
