export interface SiteSettings {
    brandName: string;
    eventYear: string;
    mainTitle: string;
    subtitle: string;
    description: string;
    eventDate: string;
    eventVenue: string;
    categoriesText: string;
    countdownDate: string;
    footer: {
        description: string;
        extraInfo: string;
        copyright: string;
    };
    contact: {
        email: string;
        phone: string;
        location: string;
    };
}
