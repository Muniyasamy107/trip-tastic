// Public business details supplied by the owner; no credentials or visitor data.
export const businessContacts=Object.freeze({
 phone:'917303215348',
 email:'triptasticholidays1430@gmail.com',
 whatsapp:'917303215348',
 instagram:'https://www.instagram.com/triptastic_holidays_/',
});
export const displayPhone=phone=>/^91\d{10}$/.test(phone)?`+91 ${phone.slice(2,7)} ${phone.slice(7)}`:`+${phone}`;
