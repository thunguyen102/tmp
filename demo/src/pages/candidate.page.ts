import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/base.page';
import { TIMEOUT } from '@/constants/timeout';

export class CandidatePage extends BasePage {
  readonly addCandidateBtn: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly vacancyInput: Locator;
  readonly contactNumberInput: Locator;
  readonly resumeUpload: Locator;
  readonly saveBtn: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.addCandidateBtn = page.locator('button:has-text("Add")').first();
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.vacancyInput = page.locator('input[placeholder*="hint"]').first();
    this.contactNumberInput = page.locator('input[name="contactNumber"]');
    this.resumeUpload = page.locator('input[type="file"]');
    this.saveBtn = page.locator('button:has-text("Save")').first();
    this.successMessage = page.locator('text=Successfully Added').first();
  }

  async navigateToCandidates(): Promise<void> {
    const recruitmentMenu = this.page.locator('span, a', { hasText: /^Recruitment$/ }).first();
    await recruitmentMenu.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(1000);

    const candidatesOption = this.page.locator('a:has-text("Candidates")').first();
    await candidatesOption.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(2000);
  }

  async clickAddCandidate(): Promise<void> {
    await this.click(this.addCandidateBtn, TIMEOUT.ELEMENT_VISIBLE);
    await this.page.waitForTimeout(3000);
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.waitFor({ timeout: 15000, state: 'visible' });
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async selectVacancy(vacancy: string): Promise<void> {
    await this.vacancyInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.vacancyInput.click();
    await this.page.waitForTimeout(500);
    const option = this.page.locator(`text=${vacancy}`).first();
    await option.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
  }

  async fillContactNumber(number: string): Promise<void> {
    await this.contactNumberInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.contactNumberInput.clear();
    await this.contactNumberInput.fill(number);
  }

  async saveCandidate(): Promise<void> {
    await this.click(this.saveBtn, TIMEOUT.ELEMENT_VISIBLE);
    await this.page.waitForTimeout(2000);
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.successMessage.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async createCandidate(data: {
    firstName: string;
    lastName: string;
    email: string;
    vacancy?: string;
    contactNumber?: string;
  }): Promise<void> {
    await this.navigateToCandidates();
    await this.clickAddCandidate();
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillEmail(data.email);
    if (data.vacancy) {
      await this.selectVacancy(data.vacancy);
    }
    if (data.contactNumber) {
      await this.fillContactNumber(data.contactNumber);
    }
    await this.saveCandidate();
  }
}
