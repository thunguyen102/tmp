import axios, { AxiosInstance } from "axios";

import { extractOtp } from "@/utils/email/otp";
import { TIMEOUT, URLS } from "@/constants";

export interface MailTmMessageSummary {
  id: string;
  subject?: string;
  intro?: string;
  from?: { address?: string; name?: string };
  createdAt?: string;
}

export interface MailTmMessageDetail extends MailTmMessageSummary {
  text?: string;
  html?: string[];
}

interface WaitForLatestOtpOptions {
  timeoutMs?: number;
  pollMs?: number;
  afterMessageId?: string;
  existingMessageIds?: string[];
  existingMessageFingerprints?: Record<string, string>;
  subjectIncludes?: RegExp;
}

interface MailTmHydraResponse<T> {
  "hydra:member"?: T[];
}

export class MailTmApiClient {
  private readonly http: AxiosInstance;
  private token = "";

  constructor(private readonly baseURL = URLS.MAIL_TM.API) {
    this.http = axios.create({
      baseURL,
      timeout: TIMEOUT.API_REQUEST,
      headers: { "Content-Type": "application/json" },
    });
  }

  async login(address: string, password: string): Promise<void> {
    const { data } = await this.http.post<{ token: string }>("/token", {
      address,
      password,
    });

    if (!data.token) {
      throw new Error(`Mail.tm did not return token for ${address}`);
    }

    this.token = data.token;
  }

  async listMessages(): Promise<MailTmMessageSummary[]> {
    this.ensureLoggedIn();

    const { data } = await this.http.get<
      MailTmHydraResponse<MailTmMessageSummary>
    >("/messages", { headers: this.authHeaders() });

    return data["hydra:member"] ?? [];
  }

  async getMessage(messageId: string): Promise<MailTmMessageDetail> {
    this.ensureLoggedIn();

    const { data } = await this.http.get<MailTmMessageDetail>(
      `/messages/${messageId}`,
      { headers: this.authHeaders() },
    );

    return data;
  }

  async captureMessageFingerprints(
    messageIds: string[],
  ): Promise<Record<string, string>> {
    const fingerprints: Record<string, string> = {};

    for (const messageId of messageIds) {
      const detail = await this.getMessage(messageId);
      fingerprints[messageId] = this.buildMessageFingerprint(detail);
    }

    return fingerprints;
  }

  async waitForLatestOtp(
    options: WaitForLatestOtpOptions = {},
  ): Promise<{ code: string; message: MailTmMessageDetail }> {
    const timeoutMs = options.timeoutMs ?? TIMEOUT.MAIL_NEW_EMAIL_WAIT;
    const pollMs = options.pollMs ?? 3_000;
    const startedAt = Date.now();
    let lastError: unknown;
    const existingMessageIds = new Set(options.existingMessageIds ?? []);
    const existingMessageFingerprints = new Map(
      Object.entries(options.existingMessageFingerprints ?? {}),
    );
    let lastSeenMessageCount = 0;
    let lastCandidateCount = 0;
    let lastFallbackCandidateCount = 0;
    let lastUpdatedExistingCount = 0;

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const messages = await this.listMessages();
        lastSeenMessageCount = messages.length;

        const freshMessages = messages.filter((message) => {
          if (message.id === options.afterMessageId) {
            return false;
          }

          return !existingMessageIds.has(message.id);
        });
        lastFallbackCandidateCount = freshMessages.length;

        const subjectMatchedMessages = this.filterMessagesBySubject(
          freshMessages,
          options,
        );
        lastCandidateCount = subjectMatchedMessages.length;

        for (const summary of this.sortNewestFirst(subjectMatchedMessages)) {
          const detail = await this.getMessage(summary.id);
          const body = this.messageToText(detail);
          const code = extractOtp(body);
          return { code, message: detail };
        }

        for (const summary of this.sortNewestFirst(freshMessages)) {
          const detail = await this.getMessage(summary.id);
          const body = this.messageToText(detail);
          const code = extractOtp(body);
          return { code, message: detail };
        }

        const updatedExistingMessages = this.sortNewestFirst(messages).filter(
          (message) => existingMessageFingerprints.has(message.id),
        );
        lastUpdatedExistingCount = updatedExistingMessages.length;

        for (const summary of updatedExistingMessages) {
          const detail = await this.getMessage(summary.id);
          const body = this.messageToText(detail);
          const previousFingerprint = existingMessageFingerprints.get(summary.id) ?? "";
          const nextFingerprint = this.buildMessageFingerprint(detail);

          if (nextFingerprint === previousFingerprint) {
            continue;
          }

          const code = extractOtp(body);
          return { code, message: detail };
        }
      } catch (error) {
        lastError = error;
      }

      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }

    const fallbackNote = options.subjectIncludes
      ? ` Subject matches last seen: ${lastCandidateCount}; fresh messages checked without subject filter: ${lastFallbackCandidateCount}; updated existing messages checked: ${lastUpdatedExistingCount}; inbox messages last seen: ${lastSeenMessageCount}.`
      : ` Inbox messages last seen: ${lastSeenMessageCount}.`;

    throw new Error(
      `OTP email was not received within ${timeoutMs}ms. Last error: ${String(
        lastError,
      )}.${fallbackNote}`,
    );
  }

  private messageToText(message: MailTmMessageDetail): string {
    return [
      message.subject ?? "",
      message.intro ?? "",
      message.text ?? "",
      ...(message.html ?? []),
    ].join("\n");
  }

  private ensureLoggedIn(): void {
    if (!this.token) {
      throw new Error("Mail.tm API client is not logged in");
    }
  }

  private authHeaders(): { Authorization: string } {
    return { Authorization: `Bearer ${this.token}` };
  }

  private buildMessageFingerprint(message: MailTmMessageDetail): string {
    return [
      message.id,
      message.createdAt ?? "",
      message.subject ?? "",
      message.intro ?? "",
      message.text ?? "",
      ...(message.html ?? []),
    ].join("\n---\n");
  }

  private filterMessagesBySubject(
    messages: MailTmMessageSummary[],
    options: WaitForLatestOtpOptions,
  ): MailTmMessageSummary[] {
    if (!options.subjectIncludes) {
      return messages;
    }

    return messages.filter((message) =>
      options.subjectIncludes!.test(`${message.subject ?? ""}\n${message.intro ?? ""}`),
    );
  }

  private sortNewestFirst(
    messages: MailTmMessageSummary[],
  ): MailTmMessageSummary[] {
    return [...messages].sort((left, right) => {
      const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
      const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
      return rightTime - leftTime;
    });
  }
}
