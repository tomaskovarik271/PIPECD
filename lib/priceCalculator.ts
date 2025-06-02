// lib/priceCalculator.ts

// Example additional cost type structure - will be refined with GraphQL types
interface AdditionalCostItem {
  amount: number;
}

// Example invoice schedule entry data structure - will be refined
interface InvoiceScheduleEntryData {
  entry_type: string;
  due_date: string; // YYYY-MM-DD
  amount_due: number;
  description?: string;
}

// Example functions based on the plan - to be implemented
export function calculateTotalDirectCost(mp: number, additionalCosts: AdditionalCostItem[]): number {
  return mp + additionalCosts.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTargetPrice(mp: number, targetMarkupPercentage: number): number {
  return mp * (1 + targetMarkupPercentage / 100);
}

export function calculateFullTargetPrice(targetPrice: number, additionalCosts: AdditionalCostItem[]): number {
  return targetPrice + additionalCosts.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateDiscountedOfferPrice(fop: number, discountPercentage: number): number {
  return fop * (1 - discountPercentage / 100);
}

export function calculateEffectiveMarkupFopOverMp(fop: number, mp: number): number {
  if (mp === 0) return 0; // Avoid division by zero
  return ((fop - mp) / mp) * 100;
}

export function determineEscalationStatus(fop: number, mp: number, totalDirectCost: number): { status: string, details: any } {
  // Placeholder logic - to be defined based on business rules
  if (fop < totalDirectCost) {
    return { status: 'requires_ceo_approval', details: { reason: 'Offer price below total direct cost' } };
  }
  if (fop < mp * 1.1) { // Example: less than 10% markup over MP
    return { status: 'requires_committee_approval', details: { reason: 'Markup less than 10% over MP' } };
  }
  return { status: 'ok', details: null };
}

export function generateBasicInvoiceSchedule(
  finalOfferPrice: number, 
  upfrontPercent: number | null | undefined, 
  upfrontDueDaysParam: number | null | undefined, 
  numInstallments: number | null | undefined, 
  installmentIntervalDaysParam: number | null | undefined
): InvoiceScheduleEntryData[] {
  const schedule: InvoiceScheduleEntryData[] = [];
  let remainingAmount = finalOfferPrice;
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];

  if (upfrontPercent && upfrontPercent > 0 && finalOfferPrice > 0) {
    const upfrontAmount = finalOfferPrice * (upfrontPercent / 100);
    remainingAmount -= upfrontAmount;
    const dueDate = new Date(today);
    const upfrontDueDays = upfrontDueDaysParam || 0;
    dueDate.setDate(today.getDate() + upfrontDueDays);
    schedule.push({
      entry_type: 'upfront',
      due_date: dueDate.toISOString().split('T')[0],
      amount_due: upfrontAmount,
      description: 'Upfront payment'
    });
  }

  const installmentIntervalDays = installmentIntervalDaysParam || 0;

  if (numInstallments && numInstallments > 0 && remainingAmount > 0 && installmentIntervalDays > 0) {
    const installmentAmount = remainingAmount / numInstallments;
    
    let lastPushedDueDateString: string;
    // If upfront payment exists, base first installment calculation on its due date.
    // Otherwise, base it on today.
    if (schedule.length > 0 && schedule[0] && typeof schedule[0].due_date === 'string') {
        lastPushedDueDateString = schedule[0].due_date;
    } else {
        lastPushedDueDateString = todayDateString;
    }
    let lastPushedDueDate = new Date(lastPushedDueDateString);

    for (let i = 1; i <= numInstallments; i++) {
      const installmentDueDate = new Date(lastPushedDueDate);

      // The first installment's due date is calculated based on `lastPushedDueDate` (either upfront or today) + interval.
      // Subsequent installments are based on the *previous installment's* due date + interval.
      if (i === 1) {
         installmentDueDate.setDate(lastPushedDueDate.getDate() + installmentIntervalDays);
      } else {
        // lastPushedDueDate here refers to the due date of the (i-1)th installment
        installmentDueDate.setDate(lastPushedDueDate.getDate() + installmentIntervalDays);
      }
      
      schedule.push({
        entry_type: `installment_${i}`,
        due_date: installmentDueDate.toISOString().split('T')[0],
        amount_due: installmentAmount,
        description: `Installment ${i}`
      });
      lastPushedDueDate = installmentDueDate; // Update for the next loop: this is now the previously pushed due date.
    }
  }
  return schedule;
} 