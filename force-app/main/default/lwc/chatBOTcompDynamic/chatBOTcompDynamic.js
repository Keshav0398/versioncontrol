import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track, wire } from 'lwc';
import getReportDownloadUrl from '@salesforce/apex/ReportDownloadController.getReportDownloadUrl';
import processVoiceInput from '@salesforce/apex/ChatGPTSOQLService.processVoiceInput';

const CHAT_CONTENT_CLASS = 'chat-content';
const AGENT_USER_TYPE = 'agent';
const CHASITOR_USER_TYPE = 'chasitor';
const SUPPORTED_USER_TYPES = [AGENT_USER_TYPE, CHASITOR_USER_TYPE];

export default class CustomBOTcomp extends BaseChatMessage {
    @track messageStyle = '';
    @track downloadUrl = '';
    showDownloadButton = false;
    voiceComp = false;
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
                this.response = result;
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

    isSupportedUserType(userType) {
        return SUPPORTED_USER_TYPES.some((supportedUserType) => supportedUserType === userType);
    }

    connectedCallback() {
        if (this.isSupportedUserType(this.userType)) {
            this.messageStyle = `${CHAT_CONTENT_CLASS} ${this.userType}`;
        } else {
            throw new Error(`Unsupported user type passed in: ${this.userType}`);
        }

        // Use multiple conditions to match report names
        const reportName = this.messageContent.value;
        
        if (reportName === 'Download Revenue Closed by Quarter report' || reportName === 'Download Top Opportunities report' || reportName === 'Download Customer Report report' || reportName === 'Download Last month sold unit analysis report') {
            this.showDownloadButton = true;
            this.fetchDownloadUrl(reportName); // Pass the report name to Apex
        } else {
            this.showDownloadButton = false;
        }

        if(this.messageContent.value === 'Voice Input') {
            this.voiceComp = true;
        } else {
            this.voiceComp = false;
        }
    }

    fetchDownloadUrl(reportName) {
        getReportDownloadUrl({ reportName })
            .then((result) => {
                this.downloadUrl = result;
            })
            .catch((error) => {
                console.error('Error fetching report download URL:', error);
            });
    }

    handleDownloadClick() {

        // Open the download URL in a new tab

        window.open(this.downloadUrl, '_self');

    }
}
