const express = require('express');
const bodyParser = require('body-parser');
const { WhatsAppAPI } = require('./utils/z-api');
const GoogleSheetsAPI = require('./utils/APIGoogleSheets');


class WebhookHandler {
    constructor(spreadsheetId, rangeName) {
        this.app = express();
        this.api = new GoogleSheetsAPI(spreadsheetId, rangeName);
    }

    startServer(host = '0.0.0.0', port = 5000) {
        this.app.use(bodyParser.json());

        this.app.post('/webhook', (req, res) => {
            const data = req.body;
            console.log('Dados recebidos:', data);
            let phone;
            let wpp;

            // Processa os dados conforme necessário
            phone = data.phone;
            wpp = new WhatsAppAPI(phone, "3CBF0E47A1C1F0D629718ABF5D20188A", "DDE2AA3AF96DEFD1471EC1ED", "F90a743cd9f1f4abea1fa94b878c0b2bcS");
            const senderName = data.senderName;

            try {
                const message = data.text.message;
                const termos = ["Oi", "oi", "Olá", "Ola", "ola", "Como vai", "como vai", "Alô", "Alo", "alo"];
                if (termos.some(termo => message.includes(termo))) {
                    wpp.sendText(`Olá ${senderName} 🌟 Boas-Vindas ao Condomínio Yacamin! 🏡 Estou aqui para ajudá-lo(a) a encontrar o seu caminho. 🗺 Por favor, me informe: qual setor você pretende visitar hoje? 🏠`);
                    const option = [
                        { id: "1", title: "Setor 1" },
                        { id: "2", title: "Setor 2" },
                        { id: "3", title: "Setor 3A" },
                        { id: "4", title: "Setor 3B" },
                        { id: "5", title: "Setor 4C" },
                        { id: "6", title: "Setor 5" },
                        { id: "7", title: "Setor 6" }
                    ];
                    wpp.sendOptionList(option);
                }
            } catch (e) {
                console.log("Erro:", e);
            }

            try {
                const optionChoice = data.listResponseMessage.title;
                if (optionChoice.includes('Setor')) {
                    this.setor = optionChoice;
                    wpp.sendText('Agora envie o número da casa:\n\n(Digite apenas o número, *Ex: 4*)');
                }
            } catch (e) {
                console.log("Erro:", e);
            }

            try {
                const message = parseInt(data.text.message);
                if (1 <= message && message <= 70) {
                    const casa = message;
                    const informacoes = this.api.buscarInformacoes(this.setor, casa);

                    if (informacoes) {
                        wpp.sendText(`📍Planejamento da Sua Visita:\nPara garantirmos uma experiência confortável, preparamos um roteiro para que você chegue até seu destino.\n🚗 Rota\n\nA casa que você irá visitar dispõe de estacionamento próprio. Aqui está o link para a localização exata onde você pode estacionar:\n\nProprietário: ${informacoes.Proprietario}\n\n${informacoes.Rotas}`);
                    } else {
                        wpp.sendText("Informações não encontradas para o setor e casa fornecido.");
                    }
                }
            } catch (e) {
                console.log("Erro:", e);
            }

            res.json(data);
        });

        this.app.listen(port, host, () => {
            console.log(`Servidor rodando em http://${host}:${port}`);
        });
    }
}

if (require.main === module) {
    const SAMPLE_SPREADSHEET_ID = '1oREYpTbM1lfUdv6aHssajVRqfRDZQLi9w7Y9wZgtzJg';
    const SAMPLE_RANGE_NAME = 'Dados!A1:D146';

    const handler = new WebhookHandler(SAMPLE_SPREADSHEET_ID, SAMPLE_RANGE_NAME);
    handler.startServer();
}

module.exports = WebhookHandler;