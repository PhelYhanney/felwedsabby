# Creative QR Studio

Build a modern, visually stunning QR code generator web app with the following features:

Core Functionality

Generate QR codes for multiple content types: URL/link, plain text, WiFi credentials (SSID + password + encryption type), contact card (vCard), email, phone number, SMS, geolocation (with a map picker or lat/long input), and file download

Tabs or a segmented control to switch between content types, each with its own relevant input fields

Real-time QR preview that updates as the user types (debounced)

File Upload/Download Feature

Let users upload a file (PDF, image, doc, zip, etc., with a reasonable size limit e.g. 10-25MB)

Since QR codes can't embed large files directly, generate a unique shareable link (e.g. via a backend/storage upload — S3, Supabase, Firebase Storage, or similar) and encode that link into the QR code

Show upload progress with an animated progress bar/spinner

Display file metadata after upload: filename, size, type icon

Optional: expiry date/time picker for the link (e.g. auto-delete after 24h/7 days/never) and a max-download-count limit

Optional: password-protect the file link before it can be downloaded

When someone scans the QR code, it should open a clean, branded download page showing the file name, size, and a "Download" button — not a raw file link

Show a copyable link alongside the QR code for the uploaded file

Customization Options

Color pickers for foreground (dots) and background color, plus a gradient option (linear/radial) with two color stops

QR "style" selector for the dot pattern: square (classic), rounded, dots, extra-rounded, classy, classy-rounded

Eye/corner style selector (separate from body dots): square, circle, rounded

Optional colored/gradient eyes different from the body

Logo upload: let the user upload an image (PNG/JPG/SVG), auto-center it on the QR code, with a slider to control logo size (as % of QR code) and an option to add a white circular/rounded background behind it so it doesn't clash

Adjustable QR error correction level (L/M/Q/H) — auto-suggest H when a logo is added, since logos need higher error correction

Adjustable margin/quiet zone and corner radius of the overall QR frame

UI/UX & Animations

Clean, modern design — soft shadows, rounded cards, generous spacing, dark/light mode toggle

Split layout: controls on the left/top, live QR preview on the right/center in a "device-like" card

Smooth transitions when switching content type tabs (slide/fade)

Animated color picker (expand/collapse), animated style swatches with hover scale effects

QR code should animate in (fade + scale) whenever regenerated, and logo upload should animate into place

Subtle micro-interactions: button ripple/press effects, drag-and-drop upload zones (for both logo and file) with hover glow

Confetti or a subtle success pulse animation when upload completes or QR is downloaded

Export Options

Download QR as PNG, SVG, and JPEG

Adjustable export resolution/size

Copy QR image to clipboard button

Copy file download link to clipboard button

Tech suggestions

Use React + Tailwind CSS + Framer Motion for animations

Use a QR generation library that supports styling and embedded logos (e.g., qr-code-styling or qrcode.react combined with canvas logo overlay)

For file storage/hosting, use a backend service (Supabase Storage, Firebase Storage, AWS S3 + presigned URLs, or a simple Node/Express + multer backend)

Fully responsive for mobile and desktop

Please structure the code cleanly into components (ContentTypeSelector, CustomizationPanel, QRPreview, LogoUploader, FileUploader, ExportControls) and include comments explaining key logic.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://felwedsabby.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ca8921d3-89f1-45b7-8953-12018df9c8fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
