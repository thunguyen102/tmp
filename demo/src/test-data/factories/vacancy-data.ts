import { DataGenerator } from '@/utils/data-generator';

export interface VacancyConfig {
  vacancyName: string;
  jobTitle: string;
  hiringManager: string;
  numberOfPositions?: number;
  description?: string;
  publish?: boolean;
}

export function createVacancyData(overrides?: Partial<VacancyConfig>): VacancyConfig {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    vacancyName: `auto_vacancy_${timestamp}_${random}`,
    jobTitle: 'Software Engineer',
    hiringManager: 'Fiona Grace',
    numberOfPositions: 1,
    description: 'Automation test vacancy',
    publish: true,
    ...overrides,
  };
}

export function createVacancyDataByJobTitle(jobTitle: string, overrides?: Partial<VacancyConfig>): VacancyConfig {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    vacancyName: `auto_${jobTitle.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${random}`,
    jobTitle,
    hiringManager: 'Fiona Grace',
    numberOfPositions: 1,
    description: `Test vacancy for ${jobTitle}`,
    publish: true,
    ...overrides,
  };
}
