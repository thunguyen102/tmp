const BASE_URL = process.env.APP_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const URLS = {
  BASE: BASE_URL,
  RECRUITMENT: {
    DASHBOARD: `${BASE_URL}/web/index.php/recruit/viewRecruit`,
    VACANCIES: `${BASE_URL}/web/index.php/recruit/viewVacancies`,
    CANDIDATES: `${BASE_URL}/web/index.php/recruit/viewCandidates`,
    PIPELINE: `${BASE_URL}/web/index.php/recruit/viewJobApplicants`,
  },
};
