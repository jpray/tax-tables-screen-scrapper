# tax-tables-screen-scrapper

This tool screen scrapes (incometaxpro.net)[https://www.incometaxpro.net/tax-rates/] pages and turns it into the JSON structure used by (taxee)[https://github.com/taxee/taxee-tax-statistics/tree/master/src/statistics/2018].

## Getting Started

- Make sure your local dev environment has Node >= 8.0 installed
- In the command line, navigate to the project root directory and run `npm install`
- Run `npm start` to run the program.
- Output files will be put in the "output" folder

## Debugging Tips

- Install (ndb)[https://github.com/GoogleChromeLabs/ndb]
- Set any desired breakpoints in the code using `debugger;`;
- Run `ndb npm start`;