import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track, wire } from 'lwc';
import getReportDownloadUrl from '@salesforce/apex/ReportDownloadController.getReportDownloadUrl';

const CHAT_CONTENT_CLASS = 'chat-content';
const AGENT_USER_TYPE = 'agent';
const CHASITOR_USER_TYPE = 'chasitor';
const SUPPORTED_USER_TYPES = [AGENT_USER_TYPE, CHASITOR_USER_TYPE];

export default class CustomBOTcomp extends BaseChatMessage {
    @track messageStyle = '';
    @track downloadUrl = '';
    showDownloadButton = false;

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
