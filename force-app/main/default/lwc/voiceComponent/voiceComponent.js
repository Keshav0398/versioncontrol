import { LightningElement, track } from 'lwc';
import processVoiceInput from '@salesforce/apex/ChatGPTSOQLService.processVoiceInput';

export default class VoiceComponent extends LightningElement {
    @track transcription = '';
    @track response = '';

    constructor() {
        super();
        this.recognition = new webkitSpeechRecognition(); // Use SpeechRecognition for other browsers
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
    }

    startVoiceInput() {
        this.recognition.start();
    }

    stopVoiceInput() {
        this.recognition.stop();
    }

    handleResult(event) {
        if (event.results.length > 0) {
            this.transcription = event.results[0][0].transcript;
            this.processTranscription();
        }
    }

    handleError(event) {
        console.error('Speech recognition error:', event.error);
    }

    processTranscription() {
    processVoiceInput({ userInput: this.transcription })
    .then(result => {
        console.log('Full response:', result); // Log the full response

        // Extract the SOQL part from the result string
        let soqlQuery = result.split('SOQL: ')[1].split('\n')[0]; // Extract the SOQL query
        console.log('Generated SOQL Query:', soqlQuery); // Log the SOQL query separately

        // Extract the actual message without the SOQL part for displaying
        let responseWithoutSOQL = result.split('\n')[1]; // Extract the result (message after SOQL)
        
        // Set the response without the SOQL query to display in the transcription div
        this.response = responseWithoutSOQL;
        this.playResponse();
    })
    .catch(error => {
        console.error('Error processing voice input:', error);
    });
}

    playResponse() {
        if (this.response) {
            let utterance = new SpeechSynthesisUtterance(this.response);
            window.speechSynthesis.speak(utterance);
        }
    }
}

