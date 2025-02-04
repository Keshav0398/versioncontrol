import { LightningElement } from 'lwc';
import getReportDownloadUrl from '@salesforce/apex/ReportDownloadController.getReportDownloadUrl';

export default class ReportDownload extends LightningElement {
    handleDownloadReport() {
        getReportDownloadUrl()
            .then((url) => {
                // Open the report URL in a new window to start the download
                window.open(url, '_blank');
            })
            .catch((error) => {
                // Handle errors here
                console.error('Error retrieving the report download URL:', error);
                // Optionally, you could show an error message on the UI
                this.showErrorNotification('Error downloading report', error.body.message);
            });
    }

    showErrorNotification(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'error',
        });
        this.dispatchEvent(evt);
    }
}
