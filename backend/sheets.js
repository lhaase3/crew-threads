const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Replace with your actual inventory sheet ID and range
const INVENTORY_SHEET_ID = '1c9TgeTiLCqnLkxkrXodPVj6qYMPggZE2wPydWOO99Lw';
const INVENTORY_RANGE = 'A2:F7'; // Includes Sold column (F)

// Replace with your actual orders sheet ID and range
const ORDERS_SHEET_ID = '197u8-yTYRMa9WrGPafujhTDy0vyokMN9tZMUTjFB5Lg';
const ORDERS_RANGE = 'A1:I1'; // Header row for appending orders (9 columns)

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

// Decrement inventory for a given size and increment Sold
async function decrementInventory(size) {
  const sheets = getSheetsClient();
  // Read inventory
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: INVENTORY_SHEET_ID,
    range: INVENTORY_RANGE,
  });
  const rows = res.data.values;
  if (!rows) throw new Error('No inventory data found');
  // Find the row for the given size
  let found = false;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].trim().toUpperCase() === size.trim().toUpperCase()) {
      let qty = parseInt(rows[i][3], 10);
      let sold = parseInt(rows[i][4], 10) || 0;
      if (qty > 0) {
        rows[i][3] = (qty - 1).toString();
        rows[i][4] = (sold + 1).toString();
        found = true;
        // Update Quantity
        await sheets.spreadsheets.values.update({
          spreadsheetId: INVENTORY_SHEET_ID,
          range: `D${i + 2}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[rows[i][3]]] },
        });
        // Update Sold (column E) - force single cell update
        await sheets.spreadsheets.values.update({
          spreadsheetId: INVENTORY_SHEET_ID,
          range: `E${i + 2}`,
          valueInputOption: 'RAW',
          majorDimension: 'COLUMNS',
          requestBody: { values: [[rows[i][4]]] },
        });
        // Also clear the cell to the right (column F) as a safeguard
        await sheets.spreadsheets.values.update({
          spreadsheetId: INVENTORY_SHEET_ID,
          range: `F${i + 2}`,
          valueInputOption: 'RAW',
          majorDimension: 'COLUMNS',
          requestBody: { values: [['']] },
        });
      } else {
        throw new Error(`Out of stock for size: ${size}`);
      }
      break;
    }
  }
  if (!found) throw new Error(`Size not found: ${size}`);
}

// Log order to orders sheet (with split address fields)
async function logOrderToSheet(order) {
  const sheets = getSheetsClient();
  const values = [[
    order.firstName,
    order.lastName,
    order.email,
    order.phone,
    order.address, // Street Address
    order.state,
    order.zipcode,
    order.size,
    order.date
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: ORDERS_SHEET_ID,
    range: ORDERS_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
}

module.exports = {
  decrementInventory,
  logOrderToSheet,
};
