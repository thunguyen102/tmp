import { DataGenerator } from './data-generator';
import { createVacancyData, VacancyConfig } from '@/test-data/factories/vacancy-data';
import { createCandidateData, CandidateConfig } from '@/test-data/factories/candidate-data';

export class TestDataBuilder {
  static vacancy() {
    return new VacancyBuilder();
  }

  static candidate() {
    return new CandidateBuilder();
  }
}

class VacancyBuilder {
  private data: VacancyConfig;

  constructor() {
    this.data = createVacancyData();
  }

  withName(name: string): VacancyBuilder {
    this.data.vacancyName = name;
    return this;
  }

  withJobTitle(jobTitle: string): VacancyBuilder {
    this.data.jobTitle = jobTitle;
    return this;
  }

  withHiringManager(manager: string): VacancyBuilder {
    this.data.hiringManager = manager;
    return this;
  }

  withPositions(count: number): VacancyBuilder {
    this.data.numberOfPositions = count;
    return this;
  }

  publishToWeb(): VacancyBuilder {
    this.data.publish = true;
    return this;
  }

  build(): VacancyConfig {
    return this.data;
  }
}

class CandidateBuilder {
  private data: CandidateConfig;

  constructor() {
    this.data = createCandidateData();
  }

  withName(firstName: string, lastName: string): CandidateBuilder {
    this.data.firstName = firstName;
    this.data.lastName = lastName;
    return this;
  }

  withEmail(email: string): CandidateBuilder {
    this.data.email = email;
    return this;
  }

  withVacancy(vacancy: string): CandidateBuilder {
    this.data.vacancy = vacancy;
    return this;
  }

  withContactNumber(number: string): CandidateBuilder {
    this.data.contactNumber = number;
    return this;
  }

  withKeywords(keywords: string): CandidateBuilder {
    this.data.keywords = keywords;
    return this;
  }

  build(): CandidateConfig {
    return this.data;
  }
}
