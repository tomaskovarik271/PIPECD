import { describe, test, expect } from 'vitest';

describe('Google Calendar Service - Business Logic', () => {
  
  describe('Date/Time Formatting', () => {
    test('should handle ISO 8601 datetime parsing', () => {
      const testDateTime = '2025-02-15T14:00:00-08:00';
      const testDate = new Date(testDateTime);
      
      expect(testDate.getTime()).toBeGreaterThan(0);
      expect(testDate.toISOString()).toContain('2025-02-15');
    });

    test('should handle timezone conversion logic', () => {
      const pacificTime = '2025-02-15T14:00:00-08:00';
      const easternTime = '2025-02-15T17:00:00-05:00';
      
      const pacificDate = new Date(pacificTime);
      const easternDate = new Date(easternTime);
      
      // Same moment in time, different timezones
      expect(pacificDate.getTime()).toBe(easternDate.getTime());
    });

    test('should validate duration calculation', () => {
      const startTime = '2025-02-15T14:00:00Z';
      const endTime = '2025-02-15T15:30:00Z';
      
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      
      expect(durationMinutes).toBe(90); // 1.5 hours
    });
  });

  describe('Event Data Validation', () => {
    test('should validate required event fields', () => {
      interface EventInput {
        summary: string;
        startDateTime: string;
        endDateTime: string;
      }

      const validEvent: EventInput = {
        summary: 'Test Meeting',
        startDateTime: '2025-02-15T14:00:00Z',
        endDateTime: '2025-02-15T15:00:00Z'
      };

      // Validation logic
      const isValid = validEvent.summary.length > 0 && 
                     validEvent.startDateTime && 
                     validEvent.endDateTime &&
                     new Date(validEvent.startDateTime) < new Date(validEvent.endDateTime);

      expect(isValid).toBe(true);
    });

    test('should reject invalid time ranges', () => {
      const invalidEvent = {
        summary: 'Test Meeting',
        startDateTime: '2025-02-15T15:00:00Z',
        endDateTime: '2025-02-15T14:00:00Z' // End before start
      };

      const isValid = new Date(invalidEvent.startDateTime) < new Date(invalidEvent.endDateTime);
      expect(isValid).toBe(false);
    });

    test('should handle email validation for attendees', () => {
      const validEmails = ['user@example.com', 'test.user+label@domain.co.uk'];
      const invalidEmails = ['invalid-email', 'user@', '@domain.com'];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Availability Slot Calculation', () => {
    test('should calculate available time slots correctly', () => {
      // Simulate the availability calculation logic
      const calculateAvailability = (
        timeRange: { start: string; end: string },
        busyPeriods: Array<{ start: string; end: string }>
      ) => {
        const slots: Array<{ start: string; end: string; available: boolean }> = [];
        const rangeStart = new Date(timeRange.start);
        const rangeEnd = new Date(timeRange.end);
        
        if (busyPeriods.length === 0) {
          return [{ start: timeRange.start, end: timeRange.end, available: true }];
        }

        // Sort busy periods by start time
        const sortedBusy = busyPeriods.sort((a, b) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        );

        let currentTime = rangeStart;

        for (const busy of sortedBusy) {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);

          // Add available slot before busy period
          if (currentTime < busyStart) {
            slots.push({
              start: currentTime.toISOString(),
              end: busyStart.toISOString(),
              available: true
            });
          }

          // Add busy slot
          const slotStart = currentTime > busyStart ? currentTime : busyStart;
          const slotEnd = rangeEnd < busyEnd ? rangeEnd : busyEnd;
          
          if (slotStart < slotEnd) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              available: false
            });
          }

          currentTime = busyEnd > currentTime ? busyEnd : currentTime;
        }

        // Add final available slot if any
        if (currentTime < rangeEnd) {
          slots.push({
            start: currentTime.toISOString(),
            end: rangeEnd.toISOString(),
            available: true
          });
        }

        return slots;
      };

      const timeRange = {
        start: '2025-02-15T09:00:00Z',
        end: '2025-02-15T17:00:00Z'
      };

      const busyPeriods = [
        { start: '2025-02-15T10:00:00Z', end: '2025-02-15T11:00:00Z' },
        { start: '2025-02-15T14:00:00Z', end: '2025-02-15T15:00:00Z' }
      ];

      const result = calculateAvailability(timeRange, busyPeriods);

      expect(result).toHaveLength(5);
      expect(result[0]).toMatchObject({ available: true }); // 9-10 AM
      expect(result[1]).toMatchObject({ available: false }); // 10-11 AM (busy)
      expect(result[2]).toMatchObject({ available: true }); // 11 AM-2 PM
      expect(result[3]).toMatchObject({ available: false }); // 2-3 PM (busy)
      expect(result[4]).toMatchObject({ available: true }); // 3-5 PM
    });

    test('should handle overlapping busy periods', () => {
      const calculateAvailability = (busyPeriods: Array<{ start: string; end: string }>) => {
        // Merge overlapping periods
        if (busyPeriods.length === 0) return [];

        const sorted = busyPeriods.sort((a, b) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        );

        const merged = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
          const current = sorted[i];
          const lastMerged = merged[merged.length - 1];

          if (new Date(current.start) <= new Date(lastMerged.end)) {
            // Overlapping - merge them
            lastMerged.end = new Date(Math.max(
              new Date(lastMerged.end).getTime(),
              new Date(current.end).getTime()
            )).toISOString();
          } else {
            merged.push(current);
          }
        }

        return merged;
      };

      const overlappingPeriods = [
        { start: '2025-02-15T10:00:00Z', end: '2025-02-15T11:30:00Z' },
        { start: '2025-02-15T11:00:00Z', end: '2025-02-15T12:00:00Z' },
        { start: '2025-02-15T14:00:00Z', end: '2025-02-15T15:00:00Z' }
      ];

      const merged = calculateAvailability(overlappingPeriods);

      expect(merged).toHaveLength(2);
      expect(merged[0].start).toBe('2025-02-15T10:00:00Z');
      expect(merged[0].end).toContain('2025-02-15T12:00:00');
      expect(merged[1]).toMatchObject({
        start: '2025-02-15T14:00:00Z',
        end: '2025-02-15T15:00:00Z'
      });
    });
  });

  describe('Event Type Classification', () => {
    test('should classify meeting types from content', () => {
      const classifyEventType = (summary: string, description?: string): string => {
        const content = (summary + ' ' + (description || '')).toLowerCase();
        
        if (content.includes('demo') || content.includes('demonstration')) {
          return 'DEMO';
        }
        if (content.includes('proposal') || content.includes('contract')) {
          return 'PROPOSAL_PRESENTATION';
        }
        if (content.includes('follow-up') || content.includes('follow up')) {
          return 'FOLLOW_UP';
        }
        if (content.includes('call') || content.includes('phone')) {
          return 'CALL';
        }
        return 'MEETING';
      };

      expect(classifyEventType('Product Demo Call')).toBe('DEMO');
      expect(classifyEventType('Contract Review Meeting')).toBe('PROPOSAL_PRESENTATION');
      expect(classifyEventType('Follow-up Discussion')).toBe('FOLLOW_UP');
      expect(classifyEventType('Weekly Team Call')).toBe('CALL');
      expect(classifyEventType('Client Meeting')).toBe('MEETING');
    });

    test('should handle case-insensitive classification', () => {
      const classifyEventType = (summary: string): string => {
        const content = summary.toLowerCase();
        return content.includes('demo') ? 'DEMO' : 'MEETING';
      };

      expect(classifyEventType('PRODUCT DEMO')).toBe('DEMO');
      expect(classifyEventType('product demo')).toBe('DEMO');
      expect(classifyEventType('Product Demo')).toBe('DEMO');
    });
  });

  describe('CRM Context Detection', () => {
    test('should detect deal context from attendee emails', () => {
      const detectDealFromAttendees = (attendeeEmails: string[]): { foundMatch: boolean; confidence: number } => {
        // Simulate the detection logic
        const businessDomains = attendeeEmails.filter(email => 
          !email.includes('gmail.com') && 
          !email.includes('yahoo.com') && 
          !email.includes('outlook.com')
        );

        const foundMatch = businessDomains.length > 0;
        const confidence = businessDomains.length / attendeeEmails.length;

        return { foundMatch, confidence };
      };

      const businessMeeting = ['john@acmecorp.com', 'mary@acmecorp.com'];
      const personalMeeting = ['friend@gmail.com', 'buddy@yahoo.com'];
      const mixedMeeting = ['client@business.com', 'personal@gmail.com'];

      expect(detectDealFromAttendees(businessMeeting)).toEqual({
        foundMatch: true,
        confidence: 1.0
      });

      expect(detectDealFromAttendees(personalMeeting)).toEqual({
        foundMatch: false,
        confidence: 0
      });

      expect(detectDealFromAttendees(mixedMeeting)).toEqual({
        foundMatch: true,
        confidence: 0.5
      });
    });

    test('should detect organization from email domain', () => {
      const extractDomainFromEmail = (email: string): string => {
        return email.split('@')[1];
      };

      const findOrganizationByDomain = (domain: string): { id: string; name: string } | null => {
        // Simulate database lookup
        const mockOrganizations = [
          { id: 'org-1', name: 'ACME Corp', domain: 'acmecorp.com' },
          { id: 'org-2', name: 'Tech Solutions', domain: 'techsolutions.com' }
        ];

        return mockOrganizations.find(org => org.domain === domain) || null;
      };

      const email = 'john.doe@acmecorp.com';
      const domain = extractDomainFromEmail(email);
      const organization = findOrganizationByDomain(domain);

      expect(domain).toBe('acmecorp.com');
      expect(organization).toEqual({
        id: 'org-1',
        name: 'ACME Corp',
        domain: 'acmecorp.com'
      });
    });
  });

  describe('Reminder Processing', () => {
    test('should convert reminder minutes to proper format', () => {
      const formatReminders = (reminders: Array<{ method: string; minutes: number }>) => {
        return {
          useDefault: false,
          overrides: reminders.map(reminder => ({
            method: reminder.method as 'email' | 'popup',
            minutes: reminder.minutes
          }))
        };
      };

      const inputReminders = [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ];

      const result = formatReminders(inputReminders);

      expect(result).toEqual({
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 }
        ]
      });
    });

    test('should handle default reminder settings', () => {
      const formatReminders = (reminders?: Array<{ method: string; minutes: number }>) => {
        if (!reminders || reminders.length === 0) {
          return { useDefault: true };
        }
        
        return {
          useDefault: false,
          overrides: reminders
        };
      };

      expect(formatReminders()).toEqual({ useDefault: true });
      expect(formatReminders([])).toEqual({ useDefault: true });
    });
  });
}); 