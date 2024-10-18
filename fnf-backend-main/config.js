import dotenv from 'dotenv';
dotenv.config({ silent: true });

// Export port and mongoDBURL for safe usage across repoe
export const PORT = process.env.PORT;

export const mongoDBURL = process.env.DB_URL;
