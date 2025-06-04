/**
 * Lead Scoring Engine
 * 
 * Calculates lead scores based on multiple factors:
 * - Contact information completeness
 * - Company information quality
 * - Estimated value
 * - Source quality
 * - Engagement indicators
 */

export interface LeadScoringResult {
  score: number;
  totalScore: number;
  factors: Record<string, any>;
}

/**
 * Calculate lead score based on available data
 */
export function calculateLeadScoreFields(leadData: any): LeadScoringResult {
  let score = 0;
  const factors: Record<string, any> = {};

  // Email factor (0-25 points)
  if (leadData.contact_email) {
    const emailScore = validateEmail(leadData.contact_email) ? 25 : 10;
    score += emailScore;
    factors.email = { score: emailScore, hasValidEmail: validateEmail(leadData.contact_email) };
  } else {
    factors.email = { score: 0, hasValidEmail: false };
  }

  // Phone factor (0-15 points)
  if (leadData.contact_phone) {
    const phoneScore = 15;
    score += phoneScore;
    factors.phone = { score: phoneScore, hasPhone: true };
  } else {
    factors.phone = { score: 0, hasPhone: false };
  }

  // Company factor (0-20 points)
  if (leadData.company_name) {
    const companyScore = leadData.company_name.length > 2 ? 20 : 10;
    score += companyScore;
    factors.company = { score: companyScore, hasCompany: true, companyName: leadData.company_name };
  } else {
    factors.company = { score: 0, hasCompany: false };
  }

  // Estimated value factor (0-25 points)
  if (leadData.estimated_value && leadData.estimated_value > 0) {
    let valueScore = 0;
    if (leadData.estimated_value >= 100000) valueScore = 25;
    else if (leadData.estimated_value >= 50000) valueScore = 20;
    else if (leadData.estimated_value >= 10000) valueScore = 15;
    else if (leadData.estimated_value >= 1000) valueScore = 10;
    else valueScore = 5;
    
    score += valueScore;
    factors.estimatedValue = { 
      score: valueScore, 
      value: leadData.estimated_value,
      category: getValueCategory(leadData.estimated_value)
    };
  } else {
    factors.estimatedValue = { score: 0, value: 0 };
  }

  // Source quality factor (0-15 points)
  const sourceScore = getSourceScore(leadData.source);
  score += sourceScore;
  factors.source = { score: sourceScore, source: leadData.source };

  // Cap the total score at 100
  const totalScore = Math.min(score, 100);

  return {
    score: totalScore,
    totalScore,
    factors
  };
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get score based on lead source quality
 */
function getSourceScore(source: string | null | undefined): number {
  if (!source) return 0;
  
  const sourceUpper = source.toUpperCase();
  
  // High-quality sources
  if (['REFERRAL', 'PARTNERSHIP', 'EXISTING_CLIENT'].includes(sourceUpper)) {
    return 15;
  }
  
  // Medium-quality sources  
  if (['WEBSITE', 'CONTENT_DOWNLOAD', 'WEBINAR', 'LINKEDIN'].includes(sourceUpper)) {
    return 10;
  }
  
  // Low-quality sources
  if (['COLD_CALL', 'COLD_EMAIL', 'ADVERTISING'].includes(sourceUpper)) {
    return 5;
  }
  
  // Unknown sources
  return 3;
}

/**
 * Categorize estimated value
 */
function getValueCategory(value: number): string {
  if (value >= 100000) return 'Enterprise';
  if (value >= 50000) return 'Large';
  if (value >= 10000) return 'Medium';
  if (value >= 1000) return 'Small';
  return 'Micro';
} 