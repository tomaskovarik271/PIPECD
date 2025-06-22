
# 🧪 **Frontend Conversion System Manual Testing Guide**

## **Prerequisites**
1. ✅ Backend services running (local Supabase)
2. ✅ GraphQL endpoint available
3. ✅ Frontend development server running (`npm run dev`)
4. ✅ Test data in database (leads, deals, organizations, people)

---

## **Phase 1: Component Integration Testing**

### **Test 1: ConvertLeadModal Component**
**Location**: Lead detail page or leads list
**Steps**:
1. Navigate to a lead detail page
2. Click "Convert to Deal" button
3. Verify modal opens with pre-populated data
4. Test form validation:
   - Try submitting with empty required fields
   - Verify error messages appear
5. Test entity creation options:
   - Toggle "Create New Person" checkbox
   - Toggle "Create New Organization" checkbox
   - Verify form fields appear/disappear
6. Test advanced options:
   - Expand "Advanced Options" section
   - Verify all options are available
7. Test conversion preview:
   - Fill out form completely
   - Verify preview section shows correct data
8. Test actual conversion:
   - Submit form with valid data
   - Verify success message
   - Check that deal was created in database
   - Verify lead status updated (if configured)

**Expected Results**:
- ✅ Modal opens smoothly
- ✅ Form validation works correctly
- ✅ Entity creation options function properly
- ✅ Conversion completes successfully
- ✅ Database records created correctly

### **Test 2: ConvertDealModal Component**
**Location**: Deal detail page
**Steps**:
1. Navigate to a deal detail page (ensure deal is not won/closed)
2. Click "Convert to Lead" button
3. Verify modal opens with deal data
4. Test WFM status validation:
   - Try converting a won/closed deal (should be prevented)
   - Verify appropriate error message
5. Test conversion reason selection:
   - Select different reasons (unqualified, timing, budget, etc.)
   - Verify reason affects form behavior
6. Test reactivation plan:
   - Enable "Create Reactivation Plan"
   - Fill out reactivation details
   - Verify plan preview
7. Test actual conversion:
   - Submit with valid data
   - Verify lead created
   - Check deal status updated
   - Verify reactivation plan created (if enabled)

**Expected Results**:
- ✅ Modal prevents invalid conversions
- ✅ Conversion reasons work correctly
- ✅ Reactivation plans created properly
- ✅ Database updates correctly

### **Test 3: BulkConvertLeadsModal Component**
**Location**: Leads list page
**Steps**:
1. Navigate to leads list
2. Select multiple leads (3-5 leads)
3. Click "Bulk Convert" button
4. Verify modal shows selected leads
5. Test global options:
   - Set global conversion settings
   - Verify they apply to all leads
6. Test individual customization:
   - Expand individual lead sections
   - Customize data for specific leads
   - Verify changes are preserved
7. Test conversion process:
   - Start bulk conversion
   - Verify progress indicators work
   - Watch real-time updates
8. Test results:
   - Verify success/failure reporting
   - Check database for created deals
   - Verify error handling for failed conversions

**Expected Results**:
- ✅ Bulk selection works correctly
- ✅ Global and individual options function
- ✅ Progress tracking works in real-time
- ✅ Results reporting is accurate
- ✅ Error handling is robust

### **Test 4: ConversionHistoryPanel Component**
**Location**: Deal/Lead detail pages
**Steps**:
1. Navigate to entity with conversion history
2. Locate conversion history panel
3. Verify history events display correctly
4. Test event expansion:
   - Click to expand conversion events
   - Verify metadata displays correctly
   - Check entity links work
5. Test filtering (if implemented):
   - Filter by conversion type
   - Filter by date range
   - Verify results update correctly
6. Test real-time updates:
   - Perform a conversion in another tab
   - Verify history updates automatically

**Expected Results**:
- ✅ History displays chronologically
- ✅ Event details are comprehensive
- ✅ Entity links navigate correctly
- ✅ Real-time updates work

---

## **Phase 2: Integration Testing**

### **Test 5: End-to-End Conversion Flow**
**Scenario**: Complete lead-to-deal-to-lead cycle
**Steps**:
1. Start with a qualified lead
2. Convert lead to deal (create new person/org)
3. Verify deal appears in kanban
4. Work with deal (add activities, notes)
5. Convert deal back to lead (unqualified reason)
6. Verify lead appears in leads list
7. Check conversion history on both entities
8. Verify activities were preserved

**Expected Results**:
- ✅ Full cycle completes without errors
- ✅ Data integrity maintained throughout
- ✅ Activities preserved across conversions
- ✅ History tracking is complete

### **Test 6: Permission Testing**
**Requirements**: Test with different user roles
**Steps**:
1. Test as admin user:
   - Verify all conversion options available
   - Test bulk operations
2. Test as member user:
   - Verify appropriate restrictions
   - Test own vs. others' entities
3. Test as read-only user:
   - Verify conversion buttons disabled/hidden
   - Test error messages for unauthorized attempts

**Expected Results**:
- ✅ Permissions enforced correctly
- ✅ UI adapts to user permissions
- ✅ Error messages are appropriate

### **Test 7: Performance Testing**
**Scenario**: Test with large datasets
**Steps**:
1. Test with 50+ leads in bulk conversion
2. Test conversion history with 100+ events
3. Monitor performance metrics:
   - Modal load times
   - Form submission times
   - Real-time update delays
4. Test with slow network (throttle to 3G)
5. Verify loading states and error handling

**Expected Results**:
- ✅ Performance remains acceptable
- ✅ Loading states provide feedback
- ✅ Error handling is graceful

---

## **Phase 3: Error Scenario Testing**

### **Test 8: Network Error Handling**
**Steps**:
1. Disconnect network during conversion
2. Submit form while offline
3. Reconnect and retry
4. Test partial failures in bulk conversion
5. Test GraphQL error responses

**Expected Results**:
- ✅ Appropriate error messages shown
- ✅ Retry mechanisms work
- ✅ Data integrity maintained

### **Test 9: Validation Edge Cases**
**Steps**:
1. Test with duplicate email addresses
2. Test with invalid phone numbers
3. Test with extremely long text fields
4. Test with special characters in names
5. Test with future/past dates

**Expected Results**:
- ✅ Validation catches edge cases
- ✅ Error messages are helpful
- ✅ Form prevents invalid submissions

---

## **Phase 4: Browser Compatibility Testing**

### **Test 10: Cross-Browser Testing**
**Browsers**: Chrome, Firefox, Safari, Edge
**Steps**:
1. Test all modals in each browser
2. Verify styling consistency
3. Test form interactions
4. Verify JavaScript functionality
5. Test responsive design on mobile

**Expected Results**:
- ✅ Consistent behavior across browsers
- ✅ No JavaScript errors
- ✅ Responsive design works

---

## **📊 Testing Checklist**

### **Pre-Testing Setup**
- [ ] Local Supabase running
- [ ] GraphQL endpoint accessible
- [ ] Frontend dev server running
- [ ] Test data populated
- [ ] User accounts with different permissions

### **Component Tests**
- [ ] ConvertLeadModal functionality
- [ ] ConvertDealModal functionality  
- [ ] BulkConvertLeadsModal functionality
- [ ] ConversionHistoryPanel functionality

### **Integration Tests**
- [ ] End-to-end conversion flows
- [ ] Permission enforcement
- [ ] Performance with large datasets
- [ ] Real-time updates

### **Error Handling Tests**
- [ ] Network error scenarios
- [ ] Validation edge cases
- [ ] GraphQL error responses
- [ ] Partial failure recovery

### **Browser Compatibility**
- [ ] Chrome testing
- [ ] Firefox testing
- [ ] Safari testing
- [ ] Edge testing
- [ ] Mobile responsive testing

---

## **🚨 Common Issues and Solutions**

### **Issue**: Modal doesn't open
**Solution**: Check browser console for JavaScript errors, verify component imports

### **Issue**: Form validation not working
**Solution**: Check GraphQL schema matches frontend types, verify validation rules

### **Issue**: Conversion fails silently
**Solution**: Check network tab for GraphQL errors, verify backend services running

### **Issue**: Real-time updates not working
**Solution**: Check WebSocket connection, verify subscription implementation

### **Issue**: Performance issues with bulk operations
**Solution**: Check batch sizes, verify loading states, optimize GraphQL queries

---

## **📈 Success Metrics**

### **Functionality**
- ✅ 100% of conversion scenarios work correctly
- ✅ All form validations function properly
- ✅ Error handling provides clear feedback
- ✅ Real-time updates work consistently

### **Performance**
- ✅ Modal load time < 500ms
- ✅ Form submission < 2s
- ✅ Bulk conversion (10 leads) < 10s
- ✅ History panel load < 1s

### **User Experience**
- ✅ Intuitive workflow progression
- ✅ Clear success/error feedback
- ✅ Responsive design on all devices
- ✅ Consistent styling and behavior

---

**🎉 When all tests pass, your conversion system is ready for production!**
