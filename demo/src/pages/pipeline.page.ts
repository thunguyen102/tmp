import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/base.page';
import { TIMEOUT } from '@/constants/timeout';

export class PipelinePage extends BasePage {
  readonly shortlistBtn: Locator;
  readonly rejectBtn: Locator;
  readonly scheduleBtn: Locator;
  readonly candidateRow: Locator;
  readonly statusCell: Locator;

  constructor(page: Page) {
    super(page);
    this.shortlistBtn = page.locator('button:has-text("Shortlist")').first();
    this.rejectBtn = page.locator('button:has-text("Reject")').first();
    this.scheduleBtn = page.locator('button:has-text("Schedule")').first();
    this.candidateRow = page.locator('tr[data-testid*="candidate"]').first();
    this.statusCell = page.locator('td').filter({ hasText: /Shortlisted|New|Rejected/ }).first();
  }

  async navigateToPipeline(): Promise<void> {
    const recruitmentMenu = this.page.locator('span, a', { hasText: /^Recruitment$/ }).first();
    await recruitmentMenu.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(1000);

    const pipelineOption = this.page.locator('a:has-text("Candidates")').first();
    await pipelineOption.click({ timeout: TIMEOUT.ELEMENT_VISIBLE });
    await this.page.waitForTimeout(2000);
  }

  async shortlistFirstCandidate(): Promise<void> {
    await this.click(this.shortlistBtn, TIMEOUT.ELEMENT_VISIBLE);
    await this.page.waitForTimeout(1500);
  }

  async isShortlistButtonVisible(): Promise<boolean> {
    return await this.shortlistBtn.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getStatusValue(): Promise<string> {
    const status = await this.statusCell.textContent({ timeout: 5000 }).catch(() => '');
    return status?.trim() || '';
  }

  async shortlistCandidate(): Promise<void> {
    await this.navigateToPipeline();
    await this.shortlistFirstCandidate();
  }
}
