import { createClient } from '@supabase/supabase-js';
import { requireAuthentication, getAccessToken, GraphQLContext } from '../helpers';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface DealLabel {
    id: string;
    deal_id: string;
    label_text: string;
    color_hex: string;
    created_by_user_id: string | null;
    created_at: string;
    updated_at: string;
}

interface LabelSuggestion {
    label_text: string;
    usage_count: number;
    color_hex: string;
    is_exact_match: boolean;
    similarity_score: number;
}

interface AddLabelToDealInput {
    dealId: string;
    labelText: string;
    colorHex?: string;
}

interface RemoveLabelFromDealInput {
    dealId: string;
    labelId: string;
}

interface UpdateLabelInput {
    labelId: string;
    labelText?: string;
    colorHex?: string;
}

interface BulkLabelOperationInput {
    dealIds: string[];
    labelTexts: string[];
    operation: 'ADD' | 'REMOVE' | 'REPLACE';
}

// Default colors for new labels
const DEFAULT_COLORS = [
    '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', 
    '#319795', '#3182ce', '#805ad5', '#d53f8c'
];

// Utility function to get random color
const getRandomColor = (): string => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_COLORS.length);
    return DEFAULT_COLORS[randomIndex] ?? DEFAULT_COLORS[0]!;
};

// Simple similarity calculation using Levenshtein distance
const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) {
        matrix[i]![0] = i;
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0]![j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i]![j] = Math.min(
                (matrix[i - 1]![j] || 0) + 1,
                (matrix[i]![j - 1] || 0) + 1,
                (matrix[i - 1]![j - 1] || 0) + cost
            );
        }
    }
    
    const maxLen = Math.max(len1, len2);
    return 1 - ((matrix[len1]![len2] || 0) / maxLen);
};

// Utility function to format deal label for GraphQL
const formatDealLabel = (label: DealLabel) => ({
    id: label.id,
    dealId: label.deal_id,
    labelText: label.label_text,
    colorHex: label.color_hex,
    createdByUserId: label.created_by_user_id || null,
    createdAt: label.created_at,
    updatedAt: label.updated_at,
});

export const dealLabelsResolvers = {
    // Extend Deal type with labels field
    Deal: {
        labels: async (parent: any, args: any, context: any) => {
            try {
                const { data, error } = await supabase
                    .from('deal_labels')
                    .select('*')
                    .eq('deal_id', parent.id)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching deal labels:', error);
                    return [];
                }

                return data?.map(formatDealLabel) || [];
            } catch (error) {
                console.error('Error in Deal.labels resolver:', error);
                return [];
            }
        },
    },

    Query: {
        // Get labels for a specific deal
        dealLabels: async (_: any, { dealId }: { dealId: string }, context: any) => {
            requireAuthentication(context);

            try {
                const { data, error } = await supabase
                    .from('deal_labels')
                    .select('*')
                    .eq('deal_id', dealId)
                    .order('created_at', { ascending: true });

                if (error) {
                    throw new Error(`Error fetching deal labels: ${error.message}`);
                }

                return data?.map(formatDealLabel) || [];
            } catch (error) {
                console.error('Error in dealLabels query:', error);
                throw error;
            }
        },

        // Suggest labels based on input
        suggestLabels: async (
            _: any,
            { input, dealId, limit = 10 }: { input: string; dealId?: string; limit?: number },
            context: GraphQLContext
        ) => {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;

            try {
                // Use authenticated client to ensure auth.uid() works in RLS policies
                const authenticatedSupabase = getAuthenticatedClient(accessToken);
                const { data, error } = await authenticatedSupabase.rpc('suggest_labels', {
                    input_text: input,
                    deal_id_param: dealId || null,
                    limit_count: limit,
                });

                if (error) {
                    throw new Error(`Error suggesting labels: ${error.message}`);
                }

                return data?.map((suggestion: any) => ({
                    labelText: suggestion.label_text || '',
                    usageCount: suggestion.usage_count || 0,
                    colorHex: suggestion.color_hex || '#3182ce',
                    isExactMatch: suggestion.is_exact_match || false,
                    similarityScore: suggestion.similarity_score || 0,
                })) || [];
            } catch (error) {
                console.error('Error in suggestLabels query:', error);
                throw error;
            }
        },

        // Get popular labels
        popularLabels: async (
            _: any,
            { limit = 20 }: { limit?: number },
            context: GraphQLContext
        ) => {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;

            try {
                // Use authenticated client to ensure auth.uid() works in RLS policies
                const authenticatedSupabase = getAuthenticatedClient(accessToken);
                const { data, error } = await authenticatedSupabase.rpc('get_popular_labels', {
                    limit_count: limit,
                });

                if (error) {
                    throw new Error(`Error fetching popular labels: ${error.message}`);
                }

                return data?.map((label: any) => ({
                    labelText: label.label_text || '',
                    usageCount: label.usage_count || 0,
                    colorHex: label.color_hex || '#3182ce',
                    isExactMatch: false,
                    similarityScore: 1.0,
                })) || [];
            } catch (error) {
                console.error('Error in popularLabels query:', error);
                throw error;
            }
        },

        // Get label usage statistics
        labelUsageStats: async (_: any, args: any, context: any) => {
            requireAuthentication(context);

            try {
                // Get total labels count
                const { count: totalLabels, error: totalError } = await supabase
                    .from('deal_labels')
                    .select('*', { count: 'exact', head: true });

                if (totalError) {
                    throw new Error(`Error counting total labels: ${totalError.message}`);
                }

                // Get unique labels count using distinct
                const { data: uniqueLabelsData, error: uniqueError } = await supabase
                    .from('deal_labels')
                    .select('label_text', { count: 'exact' })
                    .order('label_text');

                if (uniqueError) {
                    throw new Error(`Error counting unique labels: ${uniqueError.message}`);
                }

                // Calculate unique labels by removing duplicates
                const uniqueLabels = new Set(uniqueLabelsData?.map(item => item.label_text) || []);
                const totalUniqueLabels = uniqueLabels.size;

                // Get deals count for average calculation
                const { count: dealsCount, error: dealsError } = await supabase
                    .from('deals')
                    .select('*', { count: 'exact', head: true });

                if (dealsError) {
                    throw new Error(`Error counting deals: ${dealsError.message}`);
                }

                // Get popular labels
                const { data: popularData, error: popularError } = await supabase.rpc('get_popular_labels', {
                    limit_count: 10,
                });

                if (popularError) {
                    throw new Error(`Error fetching popular labels: ${popularError.message}`);
                }

                const averageLabelsPerDeal = dealsCount && dealsCount > 0 
                    ? (totalLabels || 0) / dealsCount 
                    : 0;

                return {
                    totalLabels: totalLabels || 0,
                    totalUniqueLabels,
                    averageLabelsPerDeal,
                    mostPopularLabels: popularData?.map((label: any) => ({
                        labelText: label.label_text,
                        usageCount: label.usage_count,
                        colorHex: label.color_hex,
                        isExactMatch: false,
                        similarityScore: 1.0,
                    })) || [],
                };
            } catch (error) {
                console.error('Error in labelUsageStats query:', error);
                throw error;
            }
        },

        // Search deals by labels
        dealsByLabels: async (
            _: any,
            { labelTexts, logic = 'OR', limit = 50, offset = 0 }: {
                labelTexts: string[];
                logic?: 'AND' | 'OR';
                limit?: number;
                offset?: number;
            },
            context: any
        ) => {
            requireAuthentication(context);

            try {
                let query = supabase
                    .from('deals')
                    .select(`
                        *,
                        labels:deal_labels(*)
                    `);

                if (logic === 'AND') {
                    // Deal must have ALL specified labels
                    for (const labelText of labelTexts) {
                        query = query.filter('deal_labels.label_text', 'eq', labelText);
                    }
                } else {
                    // Deal must have ANY of the specified labels
                    query = query.filter('deal_labels.label_text', 'in', `(${labelTexts.join(',')})`);
                }

                const { data, error } = await query
                    .range(offset, offset + limit - 1)
                    .order('created_at', { ascending: false });

                if (error) {
                    throw new Error(`Error searching deals by labels: ${error.message}`);
                }

                return data || [];
            } catch (error) {
                console.error('Error in dealsByLabels query:', error);
                throw error;
            }
        },
    },

    Mutation: {
        // Add label to deal
        addLabelToDeal: async (
            _: any,
            { input }: { input: AddLabelToDealInput },
            context: any
        ) => {
            const { userId } = requireAuthentication(context);

            try {
                const colorHex = input.colorHex || getRandomColor();
                const newLabelText = input.labelText.trim().toLowerCase();

                // Check for existing labels and similarity
                const { data: existingLabels, error: existingError } = await supabase
                    .from('deal_labels')
                    .select('label_text')
                    .eq('deal_id', input.dealId);

                if (existingError) {
                    throw new Error(`Error checking existing labels: ${existingError.message}`);
                }

                // Check for exact match
                const exactMatch = existingLabels?.find(label => 
                    label.label_text.toLowerCase() === newLabelText
                );
                
                if (exactMatch) {
                    throw new Error('This label already exists on this deal');
                }

                // Check for similar labels using simple string similarity
                if (existingLabels && existingLabels.length > 0) {
                    for (const existingLabel of existingLabels) {
                        const existingText = existingLabel.label_text.toLowerCase();
                        
                        // Check if one label contains the other or they're very similar
                        const similarity = calculateSimilarity(existingText, newLabelText);
                        
                        if (similarity > 0.8) {
                            throw new Error(`Similar label "${existingLabel.label_text}" already exists on this deal`);
                        }
                    }
                }

                const { error } = await supabase
                    .from('deal_labels')
                    .insert({
                        deal_id: input.dealId,
                        label_text: newLabelText,
                        color_hex: colorHex,
                        created_by_user_id: userId,
                    });

                if (error) {
                    if (error.code === '23505') { // Unique constraint violation
                        throw new Error('This label already exists on this deal');
                    }
                    throw new Error(`Error adding label to deal: ${error.message}`);
                }

                // Return the updated deal with labels
                const { data: dealData, error: dealError } = await supabase
                    .from('deals')
                    .select(`
                        *
                    `)
                    .eq('id', input.dealId)
                    .single();

                if (dealError) {
                    throw new Error(`Error fetching updated deal: ${dealError.message}`);
                }

                return dealData;
            } catch (error) {
                console.error('Error in addLabelToDeal mutation:', error);
                throw error;
            }
        },

        // Remove label from deal
        removeLabelFromDeal: async (
            _: any,
            { input }: { input: RemoveLabelFromDealInput },
            context: any
        ) => {
            requireAuthentication(context);

            try {
                const { error } = await supabase
                    .from('deal_labels')
                    .delete()
                    .eq('id', input.labelId)
                    .eq('deal_id', input.dealId);

                if (error) {
                    throw new Error(`Error removing label from deal: ${error.message}`);
                }

                // Return the updated deal
                const { data: dealData, error: dealError } = await supabase
                    .from('deals')
                    .select('*')
                    .eq('id', input.dealId)
                    .single();

                if (dealError) {
                    throw new Error(`Error fetching updated deal: ${dealError.message}`);
                }

                return dealData;
            } catch (error) {
                console.error('Error in removeLabelFromDeal mutation:', error);
                throw error;
            }
        },

        // Update label
        updateLabel: async (
            _: any,
            { input }: { input: UpdateLabelInput },
            context: any
        ) => {
            requireAuthentication(context);

            try {
                const updates: any = {};
                if (input.labelText) updates.label_text = input.labelText.trim().toLowerCase();
                if (input.colorHex) updates.color_hex = input.colorHex;
                updates.updated_at = new Date().toISOString();

                const { data, error } = await supabase
                    .from('deal_labels')
                    .update(updates)
                    .eq('id', input.labelId)
                    .select()
                    .single();

                if (error) {
                    throw new Error(`Error updating label: ${error.message}`);
                }

                return formatDealLabel(data);
            } catch (error) {
                console.error('Error in updateLabel mutation:', error);
                throw error;
            }
        },

        // Bulk label operations
        bulkLabelOperation: async (
            _: any,
            { input }: { input: BulkLabelOperationInput },
            context: any
        ) => {
            const { userId } = requireAuthentication(context);

            try {
                if (input.operation === 'ADD') {
                    // Add labels to multiple deals
                    const labelInserts = input.dealIds.flatMap(dealId =>
                        input.labelTexts.map(labelText => ({
                            deal_id: dealId,
                            label_text: labelText.trim().toLowerCase(),
                            color_hex: getRandomColor(),
                            created_by_user_id: userId,
                        }))
                    );

                    const { error } = await supabase
                        .from('deal_labels')
                        .insert(labelInserts);

                    if (error && error.code !== '23505') { // Ignore unique constraint violations
                        throw new Error(`Error adding labels: ${error.message}`);
                    }
                } else if (input.operation === 'REMOVE') {
                    // Remove labels from multiple deals
                    const { error } = await supabase
                        .from('deal_labels')
                        .delete()
                        .in('deal_id', input.dealIds)
                        .in('label_text', input.labelTexts);

                    if (error) {
                        throw new Error(`Error removing labels: ${error.message}`);
                    }
                } else if (input.operation === 'REPLACE') {
                    // Replace all labels on deals with new labels
                    // First remove existing labels
                    const { error: deleteError } = await supabase
                        .from('deal_labels')
                        .delete()
                        .in('deal_id', input.dealIds);

                    if (deleteError) {
                        throw new Error(`Error removing existing labels: ${deleteError.message}`);
                    }

                    // Then add new labels
                    const labelInserts = input.dealIds.flatMap(dealId =>
                        input.labelTexts.map(labelText => ({
                            deal_id: dealId,
                            label_text: labelText.trim().toLowerCase(),
                            color_hex: getRandomColor(),
                            created_by_user_id: userId,
                        }))
                    );

                    const { error: insertError } = await supabase
                        .from('deal_labels')
                        .insert(labelInserts);

                    if (insertError) {
                        throw new Error(`Error adding new labels: ${insertError.message}`);
                    }
                }

                // Return updated deals with labels
                const { data: dealsData, error: dealsError } = await supabase
                    .from('deals')
                    .select(`
                        *,
                        labels:deal_labels(*)
                    `)
                    .in('id', input.dealIds);

                if (dealsError) {
                    throw new Error(`Error fetching updated deals: ${dealsError.message}`);
                }

                return dealsData || [];
            } catch (error) {
                console.error('Error in bulkLabelOperation mutation:', error);
                throw error;
            }
        },

        // Merge similar labels
        mergeSimilarLabels: async (
            _: any,
            { primaryLabelText, labelsToMerge }: { primaryLabelText: string; labelsToMerge: string[] },
            context: any
        ) => {
            requireAuthentication(context);

            try {
                // Update all labels to use the primary label text
                const { data, error } = await supabase
                    .from('deal_labels')
                    .update({ 
                        label_text: primaryLabelText.trim().toLowerCase(),
                        updated_at: new Date().toISOString()
                    })
                    .in('label_text', labelsToMerge)
                    .select();

                if (error) {
                    throw new Error(`Error merging labels: ${error.message}`);
                }

                return data?.length || 0;
            } catch (error) {
                console.error('Error in mergeSimilarLabels mutation:', error);
                throw error;
            }
        },

        // Cleanup unused labels
        cleanupUnusedLabels: async (
            _: any,
            { daysUnused = 30 }: { daysUnused?: number },
            context: any
        ) => {
            requireAuthentication(context);

            try {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - daysUnused);

                const { data, error } = await supabase
                    .from('deal_labels')
                    .delete()
                    .lt('created_at', cutoffDate.toISOString())
                    .select();

                if (error) {
                    throw new Error(`Error cleaning up unused labels: ${error.message}`);
                }

                return data?.length || 0;
            } catch (error) {
                console.error('Error in cleanupUnusedLabels mutation:', error);
                throw error;
            }
        },
    },
}; 