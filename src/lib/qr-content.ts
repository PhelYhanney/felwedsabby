// Helpers to build the string encoded into the QR code for each content type.
export type ContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "file";

export interface ContentState {
  url: string;
  text: string;
  wifi: { ssid: string; password: string; encryption: "WPA" | "WEP" | "nopass"; hidden: boolean };
  vcard: { firstName: string; lastName: string; org: string; phone: string; email: string; url: string };
  email: { to: string; subject: string; body: string };
  phone: string;
  sms: { number: string; message: string };
  geo: { lat: string; lng: string };
  file: string; // shareable link
}

export const defaultContent: ContentState = {
  url: "https://mywebsite.com",
  text: "Hello, world!",
  wifi: { ssid: "MyNetwork", password: "", encryption: "WPA", hidden: false },
  vcard: { firstName: "Ada", lastName: "Lovelace", org: "", phone: "", email: "", url: "" },
  email: { to: "", subject: "", body: "" },
  phone: "",
  sms: { number: "", message: "" },
  geo: { lat: "37.7749", lng: "-122.4194" },
  file: "",
};

function esc(s: string) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

export function buildQrString(type: ContentType, c: ContentState): string {
  switch (type) {
    case "url":
      return c.url || " ";
    case "text":
      return c.text || " ";
    case "wifi":
      return `WIFI:T:${c.wifi.encryption};S:${esc(c.wifi.ssid)};P:${esc(c.wifi.password)};${c.wifi.hidden ? "H:true;" : ""};`;
    case "vcard": {
      const v = c.vcard;
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${v.lastName};${v.firstName}`,
        `FN:${v.firstName} ${v.lastName}`.trim(),
        v.org ? `ORG:${v.org}` : "",
        v.phone ? `TEL:${v.phone}` : "",
        v.email ? `EMAIL:${v.email}` : "",
        v.url ? `URL:${v.url}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "email":
      return `mailto:${c.email.to}?subject=${encodeURIComponent(c.email.subject)}&body=${encodeURIComponent(c.email.body)}`;
    case "phone":
      return `tel:${c.phone}`;
    case "sms":
      return `SMSTO:${c.sms.number}:${c.sms.message}`;
    case "geo":
      return `geo:${c.geo.lat},${c.geo.lng}`;
    case "file":
      return c.file || " ";
  }
}