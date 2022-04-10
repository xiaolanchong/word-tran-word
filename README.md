
### Basic commands

- Install: `npm install`, under Windows the following config change might be required:
    - npm config set python python2.7
    - npm config set msvs_version 2015

- Run the app: `npm run start`
- Set API repo access with a personal token: https://create-react-app.dev/docs/deployment/#troubleshooting
- Deploy to Git: `npm run deploy`


### How to add a new deck or modify an existing one

- Choose or create the dir: public/deck/<language>/new_deck.txt
- Create a tab separated text files with 2 or 3 colums: <word>\t<translation>
- Add the new file name to 'src/deck/TextDecks.json', the deck id is selected arbitrary (but must be unique)
- Run or deploy the app

### Language codes:

ISO-639 two-letter code plus extension according to https://www.w3schools.com/tags/ref_language_codes.asp
E.g.

- zh - Chinese
- zh-Hans - Chinese Simplified
- zh-Hant - Chinese Traditional
- ko - Korean
- ja - Japanese


### TODO: 

