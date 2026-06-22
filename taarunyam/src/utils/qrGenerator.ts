export async function generateQRDataUrl(certificateId: string): Promise<string> {
    const domain = import.meta.env.VITE_SITE_DOMAIN || window.location.origin;
    return `${domain}/verify/${certificateId}`;
}
