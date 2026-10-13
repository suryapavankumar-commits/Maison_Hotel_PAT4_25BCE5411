# Maison Hotel Management — Browser Edition v2

A polished,  hotel operations demo. There is  Java server, Oracle configuration, JDBC/ODBC driver, Maven setup, or payment gateway.

## Start on Windows
1. Extract the ZIP to a normal folder (not inside another ZIP preview).
2. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
3. Double-click `start-frontend.bat`. On first run, it installs the small set of Next.js dependencies, then starts the website on port **3010**.
4. Open **http://localhost:3010/login**.

Alternatively, open PowerShell in the folder containing `package.json` and run `npm install`, then `npm run dev`.

## Demo account
- Email: `admin@maisonhotel.com`
- Password: `Admin@123`

The login screen also includes **Create account** for staff profiles. The local demo checks required fields, validates email/phone, checks password confirmation and stores a hashed password in this browser profile.

## Workflows available
- **Guests:** add, search, edit and delete guest records when they have no booking/invoice history.
- **Rooms:** add/search/edit rooms, rates and status; active rooms cannot be deleted.
- **Reservations:** create, search/filter, edit and cancel bookings; overlapping dates are checked; a linked accommodation invoice is created and recalculated while unpaid.
- **Billing:** create invoices for real entries, record one or several partial payments, enter payment method and receipt/reference, and track outstanding balances. Export the invoice/payment ledger to CSV.
- **Housekeeping:** create tasks, assign a staff name, set priority and update status.
- **Backup & restore:** dashboard lets you export all business records to JSON and restore that backup in this browser.

## Data and payments — important limits
The site accepts your own hotel names, room numbers, guests, dates, invoice amounts and payment references. Business data is saved in this browser's local storage and persists after refresh. It is **not** synced to another browser/computer and clearing browser site data can remove it, so use the backup feature.

The billing module is a **manual receipt ledger only**. Recording a cash/UPI/card-terminal/bank-transfer payment does not send money or contact a payment provider. To process actual online payments or let several staff members share the same live records, a secure backend, database and payment gateway would need to be integrated separately.

## Package contents
`package.json` is at this folder's root. `start-frontend.bat` is the Windows launcher.  Java, Maven, Oracle, JDBC or ODBC installation is required.
