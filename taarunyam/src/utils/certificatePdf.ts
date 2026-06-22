import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Common html2canvas logic to capture the certificate node perfectly,
 * resolving 0px crashes by explicitly restyling the cloned DOM node.
 */
async function captureCertificateCanvas(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id ${elementId} not found`);

    return await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
                clonedElement.style.display = 'block';
                clonedElement.style.visibility = 'visible';
                clonedElement.style.width = '1123px';
                clonedElement.style.height = '794px';
                clonedElement.style.transform = 'none';
            }
        }
    });
}

/**
 * Returns a JS PDF instance from the captured canvas.
 */
async function getCertificatePdf(elementId: string): Promise<jsPDF> {
    const canvas = await captureCertificateCanvas(elementId);
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    
    // Scale image to fit A4 exactly
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;
    
    // Center it
    const x = (pdfWidth - renderWidth) / 2;
    const y = (pdfHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
    return pdf;
}

/**
 * Generates a Blob for uploading to the backend distribution API.
 */
export async function generateCertificateBlob(elementId: string): Promise<Blob> {
    const pdf = await getCertificatePdf(elementId);
    return pdf.output('blob');
}

/**
 * Generates and triggers a browser download for the user.
 */
export async function downloadCertificate(elementId: string, participantName: string): Promise<void> {
    const pdf = await getCertificatePdf(elementId);
    const filename = participantName
        ? `${participantName.replace(/\s+/g, '_')}_Taarunyam_Certificate.pdf`
        : 'Taarunyam_Certificate.pdf';
    pdf.save(filename);
}
