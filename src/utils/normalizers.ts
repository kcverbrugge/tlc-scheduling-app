// Data normalization for entering in fields to the database.
// Consists of things like trimming the whitespace off the edges, ensuring lowercase or uppercase, etc.

export function normalizeName(name: string): string {
  return name.trim()[0].toUpperCase() + name.trim().slice(1).toLowerCase(); //should capitalize the first character
}
  
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}



