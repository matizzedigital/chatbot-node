const axios = require('axios');

class WhatsAppAPI {
    constructor(phone, instanceId, tokenId, clientToken) {
        this.phone = phone;
        this.tokenId = tokenId;
        this.instanceId = instanceId;
        this.clientToken = clientToken;
        this.baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${tokenId}`;
    }

    async sendText(message) {
        const url = `${this.baseUrl}/send-text`;
        const payload = {
            phone: this.phone,
            message: message
        };
        const headers = {
            'client-token': this.clientToken,
            'Content-Type': 'application/json'
        };
        try {
            const response = await axios.post(url, payload, { headers: headers });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar mensagem de texto:', error);
            throw error;
        }
    }

    async sendOptionList(options) {
        const url = `${this.baseUrl}/send-option-list`;
        const payload = {
            phone: this.phone,
            message: "Selecione a melhor opção:",
            optionList: {
                title: "Opções disponíveis",
                buttonLabel: "Abrir lista de opções",
                options: options
            }
        };
        const headers = {
            'client-token': this.clientToken,
            'Content-Type': 'application/json'
        };
        try {
            const response = await axios.post(url, payload, { headers: headers });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar lista de opções:', error);
            throw error;
        }
    }

    async readMessage() {
        const url = `${this.baseUrl}/chats`;
        const headers = {
            'client-token': this.clientToken
        };
        try {
            const response = await axios.get(url, { headers: headers });
            return response.data;
        } catch (error) {
            console.error('Erro ao ler mensagens:', error);
            throw error;
        }
    }
}

module.exports = WhatsAppAPI;
