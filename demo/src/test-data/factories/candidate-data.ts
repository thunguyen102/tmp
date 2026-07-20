import { DataGenerator } from '@/utils/data-generator';

export interface CandidateConfig {
  firstName: string;
  lastName: string;
  email: string;
  vacancy?: string;
  contactNumber?: string;
  keywords?: string;
  notes?: string;
  resumePath?: string;
}

export function createCandidateData(overrides?: Partial<CandidateConfig>): CandidateConfig {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const firstName = `AutoTest${timestamp}`;
  const lastName = `Candidate${random}`;

  return {
    firstName,
    lastName,
    email: `auto_candidate_${timestamp}_${random}@test.com`,
    vacancy: 'Software Engineer',
    contactNumber: DataGenerator.generateTestPhone(),
    keywords: 'automation, testing',
    notes: `POC test candidate - ${firstName} ${lastName}`,
    ...overrides,
  };
}

export function createCandidateDataWithName(firstName: string, lastName: string, overrides?: Partial<CandidateConfig>): CandidateConfig {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    firstName,
    lastName,
    email: `auto_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${timestamp}_${random}@test.com`,
    vacancy: 'Software Engineer',
    contactNumber: DataGenerator.generateTestPhone(),
    keywords: 'automation, testing',
    notes: `POC test - ${firstName} ${lastName}`,
    ...overrides,
  };
}
