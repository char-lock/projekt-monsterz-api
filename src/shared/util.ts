/// util.ts
///
/// [Description]
/// Defines utility functions that are used throughout the application.
///
/// [Author]
/// Lockett, Charlotte <lockettc@protonmail.com>
///
/// [Date]
/// 2023/03/23
///

/**
 * Interprets a string value as a boolean using a handful of standard
 * options.
 * 
 * Note: any values not believed to be "truthy" (`1`, `y`, `Y`) will be
 * seen as false.
 */
function parseBoolean(value: string): boolean {
  if (!value) return false;
  if (value.length === 0) return false;
  if (value[0] === "1" || value.toLowerCase()[0] === "y") return true;
  return false;
}

export { parseBoolean };
