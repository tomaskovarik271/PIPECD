# Activity DateTime 15-Minute Intervals Implementation

## Overview

Updated all activity-related datetime selectors to use 15-minute intervals instead of minute-based precision, making scheduling more practical and aligned with typical meeting scheduling conventions.

## Changes Made

### 1. CreateActivityForm.tsx
**File**: `frontend/src/components/activities/CreateActivityForm.tsx`
**Line**: 210-216

Added `step={900}` attribute to the datetime-local input:
```tsx
<Input
  id='due_date'
  type='datetime-local'
  step={900} // 15-minute intervals (15 minutes × 60 seconds = 900 seconds)
  {...register('due_date')}
/>
```

### 2. EditActivityForm.tsx
**File**: `frontend/src/components/activities/EditActivityForm.tsx`
**Line**: 231-237

Added `step={900}` attribute to the datetime-local input:
```tsx
<Input
  id='due_date'
  type='datetime-local'
  step={900} // 15-minute intervals (15 minutes × 60 seconds = 900 seconds)
  {...register('due_date')}
/>
```

### 3. DealEmailsPanel.tsx (CreateTaskModal)
**File**: `frontend/src/components/deals/DealEmailsPanel.tsx`
**Line**: 825-830

Added `step={900}` attribute to the datetime-local input in the task creation modal:
```tsx
<Input
  type="datetime-local"
  step={900} // 15-minute intervals (15 minutes × 60 seconds = 900 seconds)
  value={formData.dueDate}
  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
/>
```

## Technical Details

### Step Attribute
- **Value**: `900` seconds
- **Calculation**: 15 minutes × 60 seconds/minute = 900 seconds
- **Effect**: Browser datetime picker will only allow time selection in 15-minute increments

### Available Time Options
Users can now only select times in these intervals:
- 9:00, 9:15, 9:30, 9:45, 10:00, etc.

### Browser Compatibility
The `step` attribute for `datetime-local` inputs is supported in:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- All modern browsers support this HTML5 feature

## User Experience Impact

### Before
- Users could select any minute (e.g., 9:07, 9:23, 9:41)
- Less practical for real-world scheduling
- More precision than typically needed

### After
- Users can only select 15-minute intervals (e.g., 9:00, 9:15, 9:30, 9:45)
- Aligns with standard calendar/meeting scheduling practices
- Cleaner, more organized time selection
- Easier to coordinate with typical meeting schedules

## Affected Components

1. **Main Activities Page**: Create new activity modal
2. **Deal Detail Page**: Create new activity for deal
3. **Activities Edit**: Edit existing activity times
4. **Email Panel**: Create task from email functionality

## Testing

### Manual Testing Steps

1. **Create New Activity**:
   - Open any create activity modal
   - Click on the Due Date/Time field
   - Verify time picker only shows 15-minute intervals

2. **Edit Activity**:
   - Edit an existing activity
   - Check that time selection is limited to 15-minute intervals

3. **Email Task Creation**:
   - In deal detail emails panel
   - Create task from email
   - Verify time picker uses 15-minute intervals

### Expected Behavior

- Time dropdown/picker shows: :00, :15, :30, :45 options only
- No other minute values should be selectable
- Existing times not on 15-minute boundaries will be preserved but new selections are constrained

## Benefits

1. **Improved UX**: More intuitive time selection
2. **Scheduling Alignment**: Matches typical calendar apps
3. **Reduced Cognitive Load**: Fewer time options to choose from
4. **Professional Appearance**: Cleaner time formatting
5. **Meeting Coordination**: Easier to align with standard meeting times

## Future Considerations

- Could be made configurable via user preferences
- Different intervals could be supported (5, 10, 30 minutes)
- Time zone handling remains unchanged
- Backend validation unchanged (still accepts any valid datetime) 