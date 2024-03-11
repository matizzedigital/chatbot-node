const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

class GoogleSheetsAPI {
    constructor(spreadsheetId, rangeName) {
        this.spreadsheetId = spreadsheetId;
        this.rangeName = rangeName;
        this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
        this.credentialsPath = 'credentials.json';
        this.tokenPath = 'token.json';
    }

    async setupService() {
        try {
            const content = fs.readFileSync(this.credentialsPath);
            const credentials = JSON.parse(content);
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            if (fs.existsSync(this.tokenPath)) {
                const token = fs.readFileSync(this.tokenPath);
                oAuth2Client.setCredentials(JSON.parse(token));
            } else {
                await this.getAccessToken(oAuth2Client);
            }

            return google.sheets({ version: 'v4', auth: oAuth2Client });
        } catch (error) {
            console.error('Erro ao configurar o serviço do Google Sheets:', error);
            throw error;
        }
    }

    async getAccessToken(oAuth2Client) {
        try {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            const code = await new Promise((resolve, reject) => {
                rl.question('Enter the code from that page here: ', (code) => {
                    resolve(code);
                });
            });
            rl.close();
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(this.tokenPath, JSON.stringify(tokens));
            console.log('Token stored to', this.tokenPath);
        } catch (error) {
            console.error('Error retrieving access token:', error);
            throw error;
        }
    }

    async buscarInformacoes(setor, casa) {
        try {
            const service = await this.setupService();
            const response = await service.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.rangeName,
            });
            const values = response.data.values;
            for (const item of values) {
                if (item[0] === setor && item[1] === casa) {
                    return { "Proprietário": item[2], "Rotas": item[3] };
                }
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar informações:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetsAPI;
