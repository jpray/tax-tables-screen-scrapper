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

function getBareOutputStructureNoTax() {
    return {
        "single": {
            "type": "none",
        },
        "married": {
            "type": "none",
        },
        "married_separately": {
            "type": "none",
        },
        "head_of_household": {
            "type": "none",
        }
    }
}

function getIncomeTaxBracketsForFilingStatus(filingStatusName, html) {

    let brackets = []
    let contentBlocks = html.split('<table class="statebrackets">').map(e => '<table class="statebrackets">'+e);

    let contentBlock;
    if(filingStatusName === 4) {
        contentBlock = contentBlocks[4].split('</table>').map(e => e+'</table>')[0];
    } else {
        contentBlock = contentBlocks[filingStatusName];
    }

    let listBlock = contentBlock.split('<tbody>')[1].split('</tbody>')[0];
    let lists = listBlock.split('</td></tr>').map(e => e+'</td></tr>');

    lists.slice(0,-1).forEach(e => {
        let level = e.split('<td>').map(el => {
            return el.split('</td>')[0].replace('$','').replace(/,/g, '');
        });
        let bracket = parseFloat(level[1]);
        let rate = parseFloat(level[4]);
        let bracketFormat = bracket ? bracket-1 : bracket;
        brackets = [...brackets, {bracket: bracketFormat, marginal_rate: rate}] 
    });

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
        const html = await getHtmlForState(stateName[0]);
        const output = getBareOutputStructure();
        const outputNone = getBareOutputStructureNoTax();
        output[SINGLE][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(1, html);
        output[MARRIED_FILING_JOINTLY][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(2, html);
        output[MARRIED_FILING_SEPARATELY][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(3, html);
        output[HEAD_OF_HOUSEHOLD][INCOME_TAX_BRACKETS] = getIncomeTaxBracketsForFilingStatus(4, html);
        if(output[SINGLE][INCOME_TAX_BRACKETS].length === 1 && output[SINGLE][INCOME_TAX_BRACKETS][0].bracket === 0 && output[SINGLE][INCOME_TAX_BRACKETS][0].marginal_rate === 0) {
            writeOutputToDisk(stateName[1], outputNone);
        } else {
            writeOutputToDisk(stateName[1], output);
        }
    }

})();