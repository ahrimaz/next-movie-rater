import prisma from './db';

// Generate a username based on user's name or email
export async function generateUsername(name: string | null, email: string): Promise<string> {
  // Start with the name if available, otherwise use email
  let baseUsername = '';
  
  if (name && name.trim().length > 0) {
    // Use the name, removing spaces and special characters
    baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  } else {
    // Use the part of the email before @
    baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // Make sure it's at least 3 characters
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, '0');
  }
  
  // Truncate if too long
  if (baseUsername.length > 20) {
    baseUsername = baseUsername.substring(0, 20);
  }
  
  // Check if this username already exists
  let username = baseUsername;
  let counter = 1;
  
  // Keep trying until we find an available username
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!existingUser) {
      // Username is available
      return username;
    }
    
    // Try with a number appended
    username = `${baseUsername}${counter}`;
    counter++;
  }
}

// Validate a username format (allow alphanumeric chars and some special chars)
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9_\-\.]{3,20}$/i;
  return usernameRegex.test(username);
}

// Get a user by their username
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username }
  });
}

// Ensure all existing users have usernames
export async function ensureUsernames() {
  const usersWithoutUsername = await prisma.user.findMany({
    where: { username: null }
  });
  
  for (const user of usersWithoutUsername) {
    const username = await generateUsername(user.name, user.email);
    await prisma.user.update({
      where: { id: user.id },
      data: { username }
    });
  }
}

// Get a user by their ID or username
export async function getUser(idOrUsername: string) {
  // First try to find by username
  const userByUsername = await prisma.user.findUnique({
    where: { username: idOrUsername }
  });
  
  if (userByUsername) {
    return userByUsername;
  }
  
  // If not found, try by ID
  return prisma.user.findUnique({
    where: { id: idOrUsername }
  });
} 