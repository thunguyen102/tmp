export class DataGenerator {
  static generateTestEmail(featureName: string = 'test'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `auto_${featureName}_${timestamp}_${random}@test.com`;
  }

  static generateTestUsername(featureName: string = 'test'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `auto_${featureName}_${timestamp}`;
  }

  static generateTestPassword(): string {
    return `AutoTest${Date.now()}@123`;
  }

  static generateTestPhone(): string {
    return `555${String(Date.now()).slice(-7)}`;
  }

  static generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static generateTraceableId(prefix: string = 'test'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static getRandomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  static getRandomNumber(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
