import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/base.page';
import { TIMEOUT } from '@/constants/timeout';

export class VacancyPage extends BasePage {
  readonly addVacancyBtn: Locator;
  readonly vacancyNameInput: Locator;
  readonly jobTitleInput: Locator;
  readonly hiringManagerInput: Locator;
  readonly positionsInput: Locator;
  readonly descriptionArea: Locator;
  readonly publishCheckbox: Locator;
  readonly saveBtn: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.addVacancyBtn = page.locator('button:has-text("Add")').first();
    this.vacancyNameInput = page.locator('input[name="vacancyName"]');
    this.jobTitleInput = page.locator('input[placeholder*="hint"]').first();
    this.hiringManagerInput = page.locator('input[placeholder*="hint"]').nth(1);
    this.positionsInput = page.locator('input[name="numOfPositions"]');
    this.descriptionArea = page.locator('textarea[name="description"]');
    this.publishCheckbox = page.locator('input[type="checkbox"]').first();
    this.saveBtn = page.locator('button:has-text("Save")').first();
    this.successMessage = page.locator('text=Successfully Added').first();
  }

  async navigateToVacancies(): Promise<void> {
    const recruitmentMenu = this.page.locator('span, a', { hasText: /^Recruitment$/ }).first();
    await recruitmentMenu.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(1000);

    const vacanciesOption = this.page.locator('a:has-text("Vacancies")').first();
    await vacanciesOption.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(2000);
  }

  async clickAddVacancy(): Promise<void> {
    await this.click(this.addVacancyBtn, TIMEOUT.ELEMENT_VISIBLE);
    await this.page.waitForTimeout(3000);
  }

  async fillVacancyName(name: string): Promise<void> {
    await this.vacancyNameInput.waitFor({ timeout: 15000, state: 'visible' });
    await this.vacancyNameInput.clear();
    await this.vacancyNameInput.fill(name);
  }

  async selectJobTitle(jobTitle: string): Promise<void> {
    await this.jobTitleInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.jobTitleInput.click();
    await this.page.waitForTimeout(500);
    const option = this.page.locator(`text=${jobTitle}`).first();
    await option.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
  }

  async selectHiringManager(manager: string): Promise<void> {
    await this.hiringManagerInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.hiringManagerInput.click();
    await this.page.waitForTimeout(500);
    const option = this.page.locator(`text=${manager}`).first();
    await option.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
  }

  async fillPositions(count: number): Promise<void> {
    await this.positionsInput.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.positionsInput.clear();
    await this.positionsInput.fill(count.toString());
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionArea.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.descriptionArea.clear();
    await this.descriptionArea.fill(description);
  }

  async togglePublish(): Promise<void> {
    await this.publishCheckbox.waitFor({ timeout: TIMEOUT.ELEMENT_VISIBLE, state: 'visible' });
    await this.publishCheckbox.check();
  }

  async saveVacancy(): Promise<void> {
    await this.click(this.saveBtn, TIMEOUT.ELEMENT_VISIBLE);
    await this.page.waitForTimeout(2000);
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.successMessage.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async createVacancy(data: {
    name: string;
    jobTitle: string;
    hiringManager: string;
    positions: number;
    description: string;
    publish?: boolean;
  }): Promise<void> {
    await this.navigateToVacancies();
    await this.clickAddVacancy();
    await this.fillVacancyName(data.name);
    await this.selectJobTitle(data.jobTitle);
    await this.selectHiringManager(data.hiringManager);
    await this.fillPositions(data.positions);
    await this.fillDescription(data.description);
    if (data.publish) {
      await this.togglePublish();
    }
    await this.saveVacancy();
  }
}
