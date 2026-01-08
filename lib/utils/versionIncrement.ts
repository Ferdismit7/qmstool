/**
 * Helper function to increment version numbers
 * Supports formats like "1.0", "2.5", "1", "2", etc.
 * 
 * @param currentVersion - The current version string
 * @returns The incremented version string
 * 
 * @example
 * incrementVersion("1.0") // Returns "1.1"
 * incrementVersion("2.5") // Returns "2.6"
 * incrementVersion("1") // Returns "2.0"
 * incrementVersion("") // Returns "1.0"
 */
export const incrementVersion = (currentVersion: string): string => {
  if (!currentVersion) return '1.0';
  
  // Try to parse as decimal version (e.g., "1.0", "2.5")
  const match = currentVersion.match(/^(\d+)\.(\d+)$/);
  if (match) {
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);
    return `${major}.${minor + 1}`;
  }
  
  // Try to parse as integer version (e.g., "1", "2")
  const intMatch = currentVersion.match(/^(\d+)$/);
  if (intMatch) {
    const num = parseInt(intMatch[1]);
    return `${num + 1}.0`;
  }
  
  // Default: append .1 or increment last number
  return `${currentVersion}.1`;
};

