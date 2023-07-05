export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value) {
    if (defaultValue) {
      return defaultValue;
    } else {
      throw Error(`Environment variable ${name} is not defined!`);
    }
  }
  return value;
}
