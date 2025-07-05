/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query GetAssignableUsersForCreateOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  ": typeof types.GetAssignableUsersForCreateOrgDocument,
    "\n    query GetAssignableUsersForEditOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  ": typeof types.GetAssignableUsersForEditOrgDocument,
    "\n  query GetAssignableUsersForAccountMgmt {\n    assignableUsers {\n      id\n      display_name\n      email\n      avatar_url\n    }\n  }\n": typeof types.GetAssignableUsersForAccountMgmtDocument,
    "\n  query GetAgentThoughts($conversationId: ID!, $limit: Int) {\n    agentThoughts(conversationId: $conversationId, limit: $limit) {\n      id\n      conversationId\n      type\n      content\n      metadata\n      timestamp\n    }\n  }\n": typeof types.GetAgentThoughtsDocument,
    "\n  mutation ComposeEmail($input: ComposeEmailInput!) {\n    composeEmail(input: $input) {\n      id\n      subject\n      from\n      to\n      timestamp\n    }\n  }\n": typeof types.ComposeEmailDocument,
    "\n  mutation ConvertDealToLeadModal($id: ID!, $input: DealToLeadConversionInput!) {\n    convertDealToLead(id: $id, input: $input) {\n      success\n      message\n      conversionId\n      lead {\n        id\n        name\n        estimated_value\n        contact_name\n        company_name\n      }\n    }\n  }\n": typeof types.ConvertDealToLeadModalDocument,
    "\n  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {\n    convertLead(id: $id, input: $input) {\n      leadId\n      convertedEntities {\n        person {\n          id\n          first_name\n          last_name\n          email\n        }\n        organization {\n          id\n          name\n        }\n        deal {\n          id\n          name\n          amount\n          currency\n        }\n      }\n    }\n  }\n": typeof types.ConvertLeadDocument,
    "\n        query GetProjectTypes {\n          wfmProjectTypes {\n            id\n            name\n          }\n        }\n      ": typeof types.GetProjectTypesDocument,
    "\n  mutation CreateContactFromEmail($input: CreateContactFromEmailInput!) {\n    createContactFromEmail(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": typeof types.CreateContactFromEmailDocument,
    "\n  query GetOrganizationsForContact {\n    organizations {\n      id\n      name\n    }\n  }\n": typeof types.GetOrganizationsForContactDocument,
    "\n  query GetEmailThreads($filter: EmailThreadsFilterInput!) {\n    getEmailThreads(filter: $filter) {\n      threads {\n        id\n        subject\n        participants\n        messageCount\n        isUnread\n        lastActivity\n        latestMessage {\n          id\n          from\n          body\n          timestamp\n          hasAttachments\n        }\n      }\n      totalCount\n      hasNextPage\n      nextPageToken\n    }\n  }\n": typeof types.GetEmailThreadsDocument,
    "\n  query GetEmailThread($threadId: String!) {\n    getEmailThread(threadId: $threadId) {\n      id\n      subject\n      participants\n      messageCount\n      isUnread\n      lastActivity\n      latestMessage {\n        id\n        threadId\n        subject\n        from\n        to\n        cc\n        bcc\n        body\n        htmlBody\n        timestamp\n        isUnread\n        hasAttachments\n        attachments {\n          id\n          filename\n          mimeType\n          size\n        }\n        importance\n      }\n    }\n  }\n": typeof types.GetEmailThreadDocument,
    "\n  query GetEmailAnalytics($dealId: String!) {\n    getEmailAnalytics(dealId: $dealId) {\n      totalThreads\n      unreadCount\n      avgResponseTime\n      lastContactTime\n      emailSentiment\n      responseRate\n    }\n  }\n": typeof types.GetEmailAnalyticsDocument,
    "\n  mutation MarkThreadAsRead($threadId: String!) {\n    markThreadAsRead(threadId: $threadId)\n  }\n": typeof types.MarkThreadAsReadDocument,
    "\n  mutation CreateSticker($input: CreateStickerInput!) {\n    createSticker(input: $input) {\n      id\n      title\n      content\n      entityType\n      entityId\n      positionX\n      positionY\n      width\n      height\n      color\n      isPinned\n      isPrivate\n      priority\n      mentions\n      tags\n      createdAt\n      updatedAt\n      createdByUserId\n      category {\n        id\n        name\n        color\n        icon\n      }\n    }\n  }\n": typeof types.CreateStickerDocument,
    "\n  mutation PinEmail($input: PinEmailInput!) {\n    pinEmail(input: $input) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n": typeof types.PinEmailDocument,
    "\n  query GetPinnedEmailsForDeal($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n": typeof types.GetPinnedEmailsForDealDocument,
    "\n    mutation UnpinEmail($id: ID!) {\n      unpinEmail(id: $id)\n    }\n  ": typeof types.UnpinEmailDocument,
    "\n  query GetDealWorkflowSteps($dealId: ID!) {\n    deal(id: $dealId) {\n      id\n      wfmProject {\n        id\n        workflow {\n          id\n          name\n          steps {\n            id\n            stepOrder\n            isInitialStep\n            isFinalStep\n            status {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetDealWorkflowStepsDocument,
    "\n  query GetDealParticipants($dealId: ID!) {\n    getDealParticipants(dealId: $dealId) {\n      id\n      role\n      addedFromEmail\n      person {\n        id\n        first_name\n        last_name\n        email\n      }\n    }\n  }\n": typeof types.GetDealParticipantsDocument,
    "\n  query SuggestEmailParticipants($dealId: ID!, $threadId: String) {\n    suggestEmailParticipants(dealId: $dealId, threadId: $threadId) {\n      id\n      first_name\n      last_name\n      email\n    }\n  }\n": typeof types.SuggestEmailParticipantsDocument,
    "\n  mutation GenerateTaskContentFromEmail($input: GenerateTaskContentInput!) {\n    generateTaskContentFromEmail(input: $input) {\n      subject\n      description\n      suggestedDueDate\n      confidence\n      emailScope\n      sourceContent\n    }\n  }\n": typeof types.GenerateTaskContentFromEmailDocument,
    "\n  query GetPinnedEmails($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetPinnedEmailsDocument,
    "\n  mutation UnpinEmail($id: ID!) {\n    unpinEmail(id: $id)\n  }\n": typeof types.UnpinEmailDocument,
    "\n  mutation UpdateEmailPin($id: ID!, $input: UpdateEmailPinInput!) {\n    updateEmailPin(id: $id, input: $input) {\n      id\n      notes\n      updatedAt\n    }\n  }\n": typeof types.UpdateEmailPinDocument,
    "\n  query GetNotificationSummary {\n    notificationSummary {\n      totalCount\n      unreadCount\n      businessRuleCount\n      systemCount\n      highPriorityCount\n    }\n  }\n": typeof types.GetNotificationSummaryDocument,
    "\n  query GetUnifiedNotifications($first: Int, $filters: NotificationFilters) {\n    unifiedNotifications(first: $first, filters: $filters) {\n      nodes {\n        source\n        id\n        title\n        message\n        notificationType\n        priority\n        entityType\n        entityId\n        actionUrl\n        isRead\n        readAt\n        dismissedAt\n        expiresAt\n        createdAt\n        updatedAt\n      }\n      totalCount\n      hasNextPage\n      hasPreviousPage\n    }\n  }\n": typeof types.GetUnifiedNotificationsDocument,
    "\n  mutation MarkSystemNotificationAsRead($id: ID!) {\n    markSystemNotificationAsRead(id: $id)\n  }\n": typeof types.MarkSystemNotificationAsReadDocument,
    "\n  mutation MarkAllSystemNotificationsAsRead {\n    markAllSystemNotificationsAsRead\n  }\n": typeof types.MarkAllSystemNotificationsAsReadDocument,
    "\n  mutation MarkBusinessRuleNotificationAsRead($id: ID!) {\n    markBusinessRuleNotificationAsRead(id: $id)\n  }\n": typeof types.MarkBusinessRuleNotificationAsReadDocument,
    "\n  mutation MarkAllBusinessRuleNotificationsAsRead {\n    markAllBusinessRuleNotificationsAsRead\n  }\n": typeof types.MarkAllBusinessRuleNotificationsAsReadDocument,
    "\n  mutation DismissSystemNotification($id: ID!) {\n    dismissSystemNotification(id: $id)\n  }\n": typeof types.DismissSystemNotificationDocument,
    "\n  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {\n    updateUserProfile(input: $input) {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n": typeof types.UpdateUserProfileDocument,
    "\n  query GetExchangeRates {\n    exchangeRates {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetExchangeRatesDocument,
    "\n  mutation SetExchangeRate($input: SetExchangeRateInput!) {\n    setExchangeRate(input: $input) {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.SetExchangeRateDocument,
    "\n  mutation UpdateRatesFromECB {\n    updateRatesFromECB {\n      success\n      message\n    }\n  }\n": typeof types.UpdateRatesFromEcbDocument,
    "\n  query GetGoogleIntegrationStatus {\n    googleIntegrationStatus {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n": typeof types.GetGoogleIntegrationStatusDocument,
    "\n  mutation RevokeGoogleIntegration {\n    revokeGoogleIntegration\n  }\n": typeof types.RevokeGoogleIntegrationDocument,
    "\n  mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {\n    connectGoogleIntegration(input: $input) {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n": typeof types.ConnectGoogleIntegrationDocument,
    "\n  query GetLeadDetails($id: ID!) {\n    lead(id: $id) {\n      id\n      name\n      source\n      description\n      contact_name\n      contact_email\n      contact_phone\n      company_name\n      estimated_value\n      estimated_close_date\n      lead_score\n      isQualified\n      assigned_to_user_id\n      assigned_at\n      converted_at\n      converted_to_deal_id\n      last_activity_at\n      created_at\n      updated_at\n      assignedToUser {\n        id\n        email\n        display_name\n        avatar_url\n      }\n      currentWfmStatus {\n        id\n        name\n        color\n      }\n    }\n  }\n": typeof types.GetLeadDetailsDocument,
    "\n  query GetStickerCategoriesForLead {\n    getStickerCategories {\n      id\n      name\n      color\n      icon\n      isSystem\n      displayOrder\n    }\n  }\n": typeof types.GetStickerCategoriesForLeadDocument,
    "\n  query GetPersonCustomFieldDefinitions {\n    customFieldDefinitions(entityType: PERSON, includeInactive: false) {\n      id\n      fieldName\n      fieldLabel\n      fieldType\n      dropdownOptions { value label }\n    }\n  }\n": typeof types.GetPersonCustomFieldDefinitionsDocument,
    "\n  query GetMe {\n    me {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query GetRoles {\n    roles {\n      id\n      name\n      description\n    }\n  }\n": typeof types.GetRolesDocument,
    "\n  mutation AssignUserRole($userId: ID!, $roleName: String!) {\n    assignUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n": typeof types.AssignUserRoleDocument,
    "\n  mutation RemoveUserRole($userId: ID!, $roleName: String!) {\n    removeUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n": typeof types.RemoveUserRoleDocument,
};
const documents: Documents = {
    "\n    query GetAssignableUsersForCreateOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  ": types.GetAssignableUsersForCreateOrgDocument,
    "\n    query GetAssignableUsersForEditOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  ": types.GetAssignableUsersForEditOrgDocument,
    "\n  query GetAssignableUsersForAccountMgmt {\n    assignableUsers {\n      id\n      display_name\n      email\n      avatar_url\n    }\n  }\n": types.GetAssignableUsersForAccountMgmtDocument,
    "\n  query GetAgentThoughts($conversationId: ID!, $limit: Int) {\n    agentThoughts(conversationId: $conversationId, limit: $limit) {\n      id\n      conversationId\n      type\n      content\n      metadata\n      timestamp\n    }\n  }\n": types.GetAgentThoughtsDocument,
    "\n  mutation ComposeEmail($input: ComposeEmailInput!) {\n    composeEmail(input: $input) {\n      id\n      subject\n      from\n      to\n      timestamp\n    }\n  }\n": types.ComposeEmailDocument,
    "\n  mutation ConvertDealToLeadModal($id: ID!, $input: DealToLeadConversionInput!) {\n    convertDealToLead(id: $id, input: $input) {\n      success\n      message\n      conversionId\n      lead {\n        id\n        name\n        estimated_value\n        contact_name\n        company_name\n      }\n    }\n  }\n": types.ConvertDealToLeadModalDocument,
    "\n  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {\n    convertLead(id: $id, input: $input) {\n      leadId\n      convertedEntities {\n        person {\n          id\n          first_name\n          last_name\n          email\n        }\n        organization {\n          id\n          name\n        }\n        deal {\n          id\n          name\n          amount\n          currency\n        }\n      }\n    }\n  }\n": types.ConvertLeadDocument,
    "\n        query GetProjectTypes {\n          wfmProjectTypes {\n            id\n            name\n          }\n        }\n      ": types.GetProjectTypesDocument,
    "\n  mutation CreateContactFromEmail($input: CreateContactFromEmailInput!) {\n    createContactFromEmail(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": types.CreateContactFromEmailDocument,
    "\n  query GetOrganizationsForContact {\n    organizations {\n      id\n      name\n    }\n  }\n": types.GetOrganizationsForContactDocument,
    "\n  query GetEmailThreads($filter: EmailThreadsFilterInput!) {\n    getEmailThreads(filter: $filter) {\n      threads {\n        id\n        subject\n        participants\n        messageCount\n        isUnread\n        lastActivity\n        latestMessage {\n          id\n          from\n          body\n          timestamp\n          hasAttachments\n        }\n      }\n      totalCount\n      hasNextPage\n      nextPageToken\n    }\n  }\n": types.GetEmailThreadsDocument,
    "\n  query GetEmailThread($threadId: String!) {\n    getEmailThread(threadId: $threadId) {\n      id\n      subject\n      participants\n      messageCount\n      isUnread\n      lastActivity\n      latestMessage {\n        id\n        threadId\n        subject\n        from\n        to\n        cc\n        bcc\n        body\n        htmlBody\n        timestamp\n        isUnread\n        hasAttachments\n        attachments {\n          id\n          filename\n          mimeType\n          size\n        }\n        importance\n      }\n    }\n  }\n": types.GetEmailThreadDocument,
    "\n  query GetEmailAnalytics($dealId: String!) {\n    getEmailAnalytics(dealId: $dealId) {\n      totalThreads\n      unreadCount\n      avgResponseTime\n      lastContactTime\n      emailSentiment\n      responseRate\n    }\n  }\n": types.GetEmailAnalyticsDocument,
    "\n  mutation MarkThreadAsRead($threadId: String!) {\n    markThreadAsRead(threadId: $threadId)\n  }\n": types.MarkThreadAsReadDocument,
    "\n  mutation CreateSticker($input: CreateStickerInput!) {\n    createSticker(input: $input) {\n      id\n      title\n      content\n      entityType\n      entityId\n      positionX\n      positionY\n      width\n      height\n      color\n      isPinned\n      isPrivate\n      priority\n      mentions\n      tags\n      createdAt\n      updatedAt\n      createdByUserId\n      category {\n        id\n        name\n        color\n        icon\n      }\n    }\n  }\n": types.CreateStickerDocument,
    "\n  mutation PinEmail($input: PinEmailInput!) {\n    pinEmail(input: $input) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n": types.PinEmailDocument,
    "\n  query GetPinnedEmailsForDeal($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n": types.GetPinnedEmailsForDealDocument,
    "\n    mutation UnpinEmail($id: ID!) {\n      unpinEmail(id: $id)\n    }\n  ": types.UnpinEmailDocument,
    "\n  query GetDealWorkflowSteps($dealId: ID!) {\n    deal(id: $dealId) {\n      id\n      wfmProject {\n        id\n        workflow {\n          id\n          name\n          steps {\n            id\n            stepOrder\n            isInitialStep\n            isFinalStep\n            status {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetDealWorkflowStepsDocument,
    "\n  query GetDealParticipants($dealId: ID!) {\n    getDealParticipants(dealId: $dealId) {\n      id\n      role\n      addedFromEmail\n      person {\n        id\n        first_name\n        last_name\n        email\n      }\n    }\n  }\n": types.GetDealParticipantsDocument,
    "\n  query SuggestEmailParticipants($dealId: ID!, $threadId: String) {\n    suggestEmailParticipants(dealId: $dealId, threadId: $threadId) {\n      id\n      first_name\n      last_name\n      email\n    }\n  }\n": types.SuggestEmailParticipantsDocument,
    "\n  mutation GenerateTaskContentFromEmail($input: GenerateTaskContentInput!) {\n    generateTaskContentFromEmail(input: $input) {\n      subject\n      description\n      suggestedDueDate\n      confidence\n      emailScope\n      sourceContent\n    }\n  }\n": types.GenerateTaskContentFromEmailDocument,
    "\n  query GetPinnedEmails($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetPinnedEmailsDocument,
    "\n  mutation UnpinEmail($id: ID!) {\n    unpinEmail(id: $id)\n  }\n": types.UnpinEmailDocument,
    "\n  mutation UpdateEmailPin($id: ID!, $input: UpdateEmailPinInput!) {\n    updateEmailPin(id: $id, input: $input) {\n      id\n      notes\n      updatedAt\n    }\n  }\n": types.UpdateEmailPinDocument,
    "\n  query GetNotificationSummary {\n    notificationSummary {\n      totalCount\n      unreadCount\n      businessRuleCount\n      systemCount\n      highPriorityCount\n    }\n  }\n": types.GetNotificationSummaryDocument,
    "\n  query GetUnifiedNotifications($first: Int, $filters: NotificationFilters) {\n    unifiedNotifications(first: $first, filters: $filters) {\n      nodes {\n        source\n        id\n        title\n        message\n        notificationType\n        priority\n        entityType\n        entityId\n        actionUrl\n        isRead\n        readAt\n        dismissedAt\n        expiresAt\n        createdAt\n        updatedAt\n      }\n      totalCount\n      hasNextPage\n      hasPreviousPage\n    }\n  }\n": types.GetUnifiedNotificationsDocument,
    "\n  mutation MarkSystemNotificationAsRead($id: ID!) {\n    markSystemNotificationAsRead(id: $id)\n  }\n": types.MarkSystemNotificationAsReadDocument,
    "\n  mutation MarkAllSystemNotificationsAsRead {\n    markAllSystemNotificationsAsRead\n  }\n": types.MarkAllSystemNotificationsAsReadDocument,
    "\n  mutation MarkBusinessRuleNotificationAsRead($id: ID!) {\n    markBusinessRuleNotificationAsRead(id: $id)\n  }\n": types.MarkBusinessRuleNotificationAsReadDocument,
    "\n  mutation MarkAllBusinessRuleNotificationsAsRead {\n    markAllBusinessRuleNotificationsAsRead\n  }\n": types.MarkAllBusinessRuleNotificationsAsReadDocument,
    "\n  mutation DismissSystemNotification($id: ID!) {\n    dismissSystemNotification(id: $id)\n  }\n": types.DismissSystemNotificationDocument,
    "\n  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {\n    updateUserProfile(input: $input) {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n": types.UpdateUserProfileDocument,
    "\n  query GetExchangeRates {\n    exchangeRates {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetExchangeRatesDocument,
    "\n  mutation SetExchangeRate($input: SetExchangeRateInput!) {\n    setExchangeRate(input: $input) {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n": types.SetExchangeRateDocument,
    "\n  mutation UpdateRatesFromECB {\n    updateRatesFromECB {\n      success\n      message\n    }\n  }\n": types.UpdateRatesFromEcbDocument,
    "\n  query GetGoogleIntegrationStatus {\n    googleIntegrationStatus {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n": types.GetGoogleIntegrationStatusDocument,
    "\n  mutation RevokeGoogleIntegration {\n    revokeGoogleIntegration\n  }\n": types.RevokeGoogleIntegrationDocument,
    "\n  mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {\n    connectGoogleIntegration(input: $input) {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n": types.ConnectGoogleIntegrationDocument,
    "\n  query GetLeadDetails($id: ID!) {\n    lead(id: $id) {\n      id\n      name\n      source\n      description\n      contact_name\n      contact_email\n      contact_phone\n      company_name\n      estimated_value\n      estimated_close_date\n      lead_score\n      isQualified\n      assigned_to_user_id\n      assigned_at\n      converted_at\n      converted_to_deal_id\n      last_activity_at\n      created_at\n      updated_at\n      assignedToUser {\n        id\n        email\n        display_name\n        avatar_url\n      }\n      currentWfmStatus {\n        id\n        name\n        color\n      }\n    }\n  }\n": types.GetLeadDetailsDocument,
    "\n  query GetStickerCategoriesForLead {\n    getStickerCategories {\n      id\n      name\n      color\n      icon\n      isSystem\n      displayOrder\n    }\n  }\n": types.GetStickerCategoriesForLeadDocument,
    "\n  query GetPersonCustomFieldDefinitions {\n    customFieldDefinitions(entityType: PERSON, includeInactive: false) {\n      id\n      fieldName\n      fieldLabel\n      fieldType\n      dropdownOptions { value label }\n    }\n  }\n": types.GetPersonCustomFieldDefinitionsDocument,
    "\n  query GetMe {\n    me {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n": types.GetMeDocument,
    "\n  query GetRoles {\n    roles {\n      id\n      name\n      description\n    }\n  }\n": types.GetRolesDocument,
    "\n  mutation AssignUserRole($userId: ID!, $roleName: String!) {\n    assignUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n": types.AssignUserRoleDocument,
    "\n  mutation RemoveUserRole($userId: ID!, $roleName: String!) {\n    removeUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n": types.RemoveUserRoleDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetAssignableUsersForCreateOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  "): (typeof documents)["\n    query GetAssignableUsersForCreateOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetAssignableUsersForEditOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  "): (typeof documents)["\n    query GetAssignableUsersForEditOrg {\n      assignableUsers {\n        id\n        display_name\n        email\n        avatar_url\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAssignableUsersForAccountMgmt {\n    assignableUsers {\n      id\n      display_name\n      email\n      avatar_url\n    }\n  }\n"): (typeof documents)["\n  query GetAssignableUsersForAccountMgmt {\n    assignableUsers {\n      id\n      display_name\n      email\n      avatar_url\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAgentThoughts($conversationId: ID!, $limit: Int) {\n    agentThoughts(conversationId: $conversationId, limit: $limit) {\n      id\n      conversationId\n      type\n      content\n      metadata\n      timestamp\n    }\n  }\n"): (typeof documents)["\n  query GetAgentThoughts($conversationId: ID!, $limit: Int) {\n    agentThoughts(conversationId: $conversationId, limit: $limit) {\n      id\n      conversationId\n      type\n      content\n      metadata\n      timestamp\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ComposeEmail($input: ComposeEmailInput!) {\n    composeEmail(input: $input) {\n      id\n      subject\n      from\n      to\n      timestamp\n    }\n  }\n"): (typeof documents)["\n  mutation ComposeEmail($input: ComposeEmailInput!) {\n    composeEmail(input: $input) {\n      id\n      subject\n      from\n      to\n      timestamp\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConvertDealToLeadModal($id: ID!, $input: DealToLeadConversionInput!) {\n    convertDealToLead(id: $id, input: $input) {\n      success\n      message\n      conversionId\n      lead {\n        id\n        name\n        estimated_value\n        contact_name\n        company_name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ConvertDealToLeadModal($id: ID!, $input: DealToLeadConversionInput!) {\n    convertDealToLead(id: $id, input: $input) {\n      success\n      message\n      conversionId\n      lead {\n        id\n        name\n        estimated_value\n        contact_name\n        company_name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {\n    convertLead(id: $id, input: $input) {\n      leadId\n      convertedEntities {\n        person {\n          id\n          first_name\n          last_name\n          email\n        }\n        organization {\n          id\n          name\n        }\n        deal {\n          id\n          name\n          amount\n          currency\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {\n    convertLead(id: $id, input: $input) {\n      leadId\n      convertedEntities {\n        person {\n          id\n          first_name\n          last_name\n          email\n        }\n        organization {\n          id\n          name\n        }\n        deal {\n          id\n          name\n          amount\n          currency\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        query GetProjectTypes {\n          wfmProjectTypes {\n            id\n            name\n          }\n        }\n      "): (typeof documents)["\n        query GetProjectTypes {\n          wfmProjectTypes {\n            id\n            name\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateContactFromEmail($input: CreateContactFromEmailInput!) {\n    createContactFromEmail(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateContactFromEmail($input: CreateContactFromEmailInput!) {\n    createContactFromEmail(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationsForContact {\n    organizations {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationsForContact {\n    organizations {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEmailThreads($filter: EmailThreadsFilterInput!) {\n    getEmailThreads(filter: $filter) {\n      threads {\n        id\n        subject\n        participants\n        messageCount\n        isUnread\n        lastActivity\n        latestMessage {\n          id\n          from\n          body\n          timestamp\n          hasAttachments\n        }\n      }\n      totalCount\n      hasNextPage\n      nextPageToken\n    }\n  }\n"): (typeof documents)["\n  query GetEmailThreads($filter: EmailThreadsFilterInput!) {\n    getEmailThreads(filter: $filter) {\n      threads {\n        id\n        subject\n        participants\n        messageCount\n        isUnread\n        lastActivity\n        latestMessage {\n          id\n          from\n          body\n          timestamp\n          hasAttachments\n        }\n      }\n      totalCount\n      hasNextPage\n      nextPageToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEmailThread($threadId: String!) {\n    getEmailThread(threadId: $threadId) {\n      id\n      subject\n      participants\n      messageCount\n      isUnread\n      lastActivity\n      latestMessage {\n        id\n        threadId\n        subject\n        from\n        to\n        cc\n        bcc\n        body\n        htmlBody\n        timestamp\n        isUnread\n        hasAttachments\n        attachments {\n          id\n          filename\n          mimeType\n          size\n        }\n        importance\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEmailThread($threadId: String!) {\n    getEmailThread(threadId: $threadId) {\n      id\n      subject\n      participants\n      messageCount\n      isUnread\n      lastActivity\n      latestMessage {\n        id\n        threadId\n        subject\n        from\n        to\n        cc\n        bcc\n        body\n        htmlBody\n        timestamp\n        isUnread\n        hasAttachments\n        attachments {\n          id\n          filename\n          mimeType\n          size\n        }\n        importance\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEmailAnalytics($dealId: String!) {\n    getEmailAnalytics(dealId: $dealId) {\n      totalThreads\n      unreadCount\n      avgResponseTime\n      lastContactTime\n      emailSentiment\n      responseRate\n    }\n  }\n"): (typeof documents)["\n  query GetEmailAnalytics($dealId: String!) {\n    getEmailAnalytics(dealId: $dealId) {\n      totalThreads\n      unreadCount\n      avgResponseTime\n      lastContactTime\n      emailSentiment\n      responseRate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkThreadAsRead($threadId: String!) {\n    markThreadAsRead(threadId: $threadId)\n  }\n"): (typeof documents)["\n  mutation MarkThreadAsRead($threadId: String!) {\n    markThreadAsRead(threadId: $threadId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSticker($input: CreateStickerInput!) {\n    createSticker(input: $input) {\n      id\n      title\n      content\n      entityType\n      entityId\n      positionX\n      positionY\n      width\n      height\n      color\n      isPinned\n      isPrivate\n      priority\n      mentions\n      tags\n      createdAt\n      updatedAt\n      createdByUserId\n      category {\n        id\n        name\n        color\n        icon\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSticker($input: CreateStickerInput!) {\n    createSticker(input: $input) {\n      id\n      title\n      content\n      entityType\n      entityId\n      positionX\n      positionY\n      width\n      height\n      color\n      isPinned\n      isPrivate\n      priority\n      mentions\n      tags\n      createdAt\n      updatedAt\n      createdByUserId\n      category {\n        id\n        name\n        color\n        icon\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PinEmail($input: PinEmailInput!) {\n    pinEmail(input: $input) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n"): (typeof documents)["\n  mutation PinEmail($input: PinEmailInput!) {\n    pinEmail(input: $input) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPinnedEmailsForDeal($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n"): (typeof documents)["\n  query GetPinnedEmailsForDeal($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UnpinEmail($id: ID!) {\n      unpinEmail(id: $id)\n    }\n  "): (typeof documents)["\n    mutation UnpinEmail($id: ID!) {\n      unpinEmail(id: $id)\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetDealWorkflowSteps($dealId: ID!) {\n    deal(id: $dealId) {\n      id\n      wfmProject {\n        id\n        workflow {\n          id\n          name\n          steps {\n            id\n            stepOrder\n            isInitialStep\n            isFinalStep\n            status {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetDealWorkflowSteps($dealId: ID!) {\n    deal(id: $dealId) {\n      id\n      wfmProject {\n        id\n        workflow {\n          id\n          name\n          steps {\n            id\n            stepOrder\n            isInitialStep\n            isFinalStep\n            status {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetDealParticipants($dealId: ID!) {\n    getDealParticipants(dealId: $dealId) {\n      id\n      role\n      addedFromEmail\n      person {\n        id\n        first_name\n        last_name\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetDealParticipants($dealId: ID!) {\n    getDealParticipants(dealId: $dealId) {\n      id\n      role\n      addedFromEmail\n      person {\n        id\n        first_name\n        last_name\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SuggestEmailParticipants($dealId: ID!, $threadId: String) {\n    suggestEmailParticipants(dealId: $dealId, threadId: $threadId) {\n      id\n      first_name\n      last_name\n      email\n    }\n  }\n"): (typeof documents)["\n  query SuggestEmailParticipants($dealId: ID!, $threadId: String) {\n    suggestEmailParticipants(dealId: $dealId, threadId: $threadId) {\n      id\n      first_name\n      last_name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GenerateTaskContentFromEmail($input: GenerateTaskContentInput!) {\n    generateTaskContentFromEmail(input: $input) {\n      subject\n      description\n      suggestedDueDate\n      confidence\n      emailScope\n      sourceContent\n    }\n  }\n"): (typeof documents)["\n  mutation GenerateTaskContentFromEmail($input: GenerateTaskContentInput!) {\n    generateTaskContentFromEmail(input: $input) {\n      subject\n      description\n      suggestedDueDate\n      confidence\n      emailScope\n      sourceContent\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPinnedEmails($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetPinnedEmails($dealId: ID!) {\n    getPinnedEmails(dealId: $dealId) {\n      id\n      emailId\n      threadId\n      subject\n      fromEmail\n      pinnedAt\n      notes\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnpinEmail($id: ID!) {\n    unpinEmail(id: $id)\n  }\n"): (typeof documents)["\n  mutation UnpinEmail($id: ID!) {\n    unpinEmail(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateEmailPin($id: ID!, $input: UpdateEmailPinInput!) {\n    updateEmailPin(id: $id, input: $input) {\n      id\n      notes\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateEmailPin($id: ID!, $input: UpdateEmailPinInput!) {\n    updateEmailPin(id: $id, input: $input) {\n      id\n      notes\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNotificationSummary {\n    notificationSummary {\n      totalCount\n      unreadCount\n      businessRuleCount\n      systemCount\n      highPriorityCount\n    }\n  }\n"): (typeof documents)["\n  query GetNotificationSummary {\n    notificationSummary {\n      totalCount\n      unreadCount\n      businessRuleCount\n      systemCount\n      highPriorityCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUnifiedNotifications($first: Int, $filters: NotificationFilters) {\n    unifiedNotifications(first: $first, filters: $filters) {\n      nodes {\n        source\n        id\n        title\n        message\n        notificationType\n        priority\n        entityType\n        entityId\n        actionUrl\n        isRead\n        readAt\n        dismissedAt\n        expiresAt\n        createdAt\n        updatedAt\n      }\n      totalCount\n      hasNextPage\n      hasPreviousPage\n    }\n  }\n"): (typeof documents)["\n  query GetUnifiedNotifications($first: Int, $filters: NotificationFilters) {\n    unifiedNotifications(first: $first, filters: $filters) {\n      nodes {\n        source\n        id\n        title\n        message\n        notificationType\n        priority\n        entityType\n        entityId\n        actionUrl\n        isRead\n        readAt\n        dismissedAt\n        expiresAt\n        createdAt\n        updatedAt\n      }\n      totalCount\n      hasNextPage\n      hasPreviousPage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkSystemNotificationAsRead($id: ID!) {\n    markSystemNotificationAsRead(id: $id)\n  }\n"): (typeof documents)["\n  mutation MarkSystemNotificationAsRead($id: ID!) {\n    markSystemNotificationAsRead(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllSystemNotificationsAsRead {\n    markAllSystemNotificationsAsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllSystemNotificationsAsRead {\n    markAllSystemNotificationsAsRead\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkBusinessRuleNotificationAsRead($id: ID!) {\n    markBusinessRuleNotificationAsRead(id: $id)\n  }\n"): (typeof documents)["\n  mutation MarkBusinessRuleNotificationAsRead($id: ID!) {\n    markBusinessRuleNotificationAsRead(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllBusinessRuleNotificationsAsRead {\n    markAllBusinessRuleNotificationsAsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllBusinessRuleNotificationsAsRead {\n    markAllBusinessRuleNotificationsAsRead\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DismissSystemNotification($id: ID!) {\n    dismissSystemNotification(id: $id)\n  }\n"): (typeof documents)["\n  mutation DismissSystemNotification($id: ID!) {\n    dismissSystemNotification(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {\n    updateUserProfile(input: $input) {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {\n    updateUserProfile(input: $input) {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetExchangeRates {\n    exchangeRates {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetExchangeRates {\n    exchangeRates {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetExchangeRate($input: SetExchangeRateInput!) {\n    setExchangeRate(input: $input) {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation SetExchangeRate($input: SetExchangeRateInput!) {\n    setExchangeRate(input: $input) {\n      id\n      fromCurrency\n      toCurrency\n      rate\n      effectiveDate\n      source\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateRatesFromECB {\n    updateRatesFromECB {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateRatesFromECB {\n    updateRatesFromECB {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGoogleIntegrationStatus {\n    googleIntegrationStatus {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n"): (typeof documents)["\n  query GetGoogleIntegrationStatus {\n    googleIntegrationStatus {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeGoogleIntegration {\n    revokeGoogleIntegration\n  }\n"): (typeof documents)["\n  mutation RevokeGoogleIntegration {\n    revokeGoogleIntegration\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {\n    connectGoogleIntegration(input: $input) {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n"): (typeof documents)["\n  mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {\n    connectGoogleIntegration(input: $input) {\n      isConnected\n      hasGoogleAuth\n      hasDriveAccess\n      hasGmailAccess\n      hasCalendarAccess\n      hasContactsAccess\n      tokenExpiry\n      missingScopes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetLeadDetails($id: ID!) {\n    lead(id: $id) {\n      id\n      name\n      source\n      description\n      contact_name\n      contact_email\n      contact_phone\n      company_name\n      estimated_value\n      estimated_close_date\n      lead_score\n      isQualified\n      assigned_to_user_id\n      assigned_at\n      converted_at\n      converted_to_deal_id\n      last_activity_at\n      created_at\n      updated_at\n      assignedToUser {\n        id\n        email\n        display_name\n        avatar_url\n      }\n      currentWfmStatus {\n        id\n        name\n        color\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLeadDetails($id: ID!) {\n    lead(id: $id) {\n      id\n      name\n      source\n      description\n      contact_name\n      contact_email\n      contact_phone\n      company_name\n      estimated_value\n      estimated_close_date\n      lead_score\n      isQualified\n      assigned_to_user_id\n      assigned_at\n      converted_at\n      converted_to_deal_id\n      last_activity_at\n      created_at\n      updated_at\n      assignedToUser {\n        id\n        email\n        display_name\n        avatar_url\n      }\n      currentWfmStatus {\n        id\n        name\n        color\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetStickerCategoriesForLead {\n    getStickerCategories {\n      id\n      name\n      color\n      icon\n      isSystem\n      displayOrder\n    }\n  }\n"): (typeof documents)["\n  query GetStickerCategoriesForLead {\n    getStickerCategories {\n      id\n      name\n      color\n      icon\n      isSystem\n      displayOrder\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPersonCustomFieldDefinitions {\n    customFieldDefinitions(entityType: PERSON, includeInactive: false) {\n      id\n      fieldName\n      fieldLabel\n      fieldType\n      dropdownOptions { value label }\n    }\n  }\n"): (typeof documents)["\n  query GetPersonCustomFieldDefinitions {\n    customFieldDefinitions(entityType: PERSON, includeInactive: false) {\n      id\n      fieldName\n      fieldLabel\n      fieldType\n      dropdownOptions { value label }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    me {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n"): (typeof documents)["\n  query GetMe {\n    me {\n      id\n      email\n      display_name\n      avatar_url\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRoles {\n    roles {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query GetRoles {\n    roles {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AssignUserRole($userId: ID!, $roleName: String!) {\n    assignUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AssignUserRole($userId: ID!, $roleName: String!) {\n    assignUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveUserRole($userId: ID!, $roleName: String!) {\n    removeUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveUserRole($userId: ID!, $roleName: String!) {\n    removeUserRole(userId: $userId, roleName: $roleName) {\n      id\n      email\n      roles {\n        id\n        name\n        description\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;