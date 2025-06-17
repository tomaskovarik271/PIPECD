import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface ThinkingParameters {
  reasoning_type: 'planning' | 'analysis' | 'decision' | 'validation' | 'synthesis';
  thought: string;
  context?: string;
  focus_areas?: string[];
  constraints?: string[];
}

export interface ThinkingResult {
  structured_thought: string;
  reasoning_steps: ReasoningStep[];
  insights: string[];
  next_actions: string[];
  confidence: number;
  assumptions: string[];
  risks: string[];
  alternatives: string[];
}

export interface ReasoningStep {
  step_number: number;
  type: 'observation' | 'analysis' | 'inference' | 'evaluation' | 'conclusion';
  description: string;
  evidence: string[];
  reasoning: string;
  confidence: number;
}

export class ThinkingTool {
  name = 'think';
  description = 'Perform structured reasoning and analysis before taking actions';
  
  parameters = {
    type: 'object',
    properties: {
      reasoning_type: {
        type: 'string',
        enum: ['planning', 'analysis', 'decision', 'validation', 'synthesis'],
        description: 'Type of reasoning to perform'
      },
      thought: {
        type: 'string',
        description: 'The thought or question to analyze'
      },
      context: {
        type: 'string',
        description: 'Additional context for the reasoning'
      },
      focus_areas: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific areas to focus the analysis on'
      },
      constraints: {
        type: 'array',
        items: { type: 'string' },
        description: 'Constraints to consider in the reasoning'
      }
    },
    required: ['reasoning_type', 'thought']
  };

  requiredPermissions: string[] = []; // No specific permissions required for thinking

  async execute(
    parameters: ThinkingParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      const startTime = Date.now();

      // Validate input
      if (!parameters.thought || parameters.thought.trim().length === 0) {
        return {
          success: false,
          error: 'Thought parameter cannot be empty',
          metadata: {
            executionTime: Date.now() - startTime,
            source: 'thinking_tool'
          }
        };
      }

      // Perform structured reasoning based on type
      const result = await this.performReasoning(parameters, context);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          source: 'thinking_tool',
          reasoning_type: parameters.reasoning_type
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Thinking process failed: ${error.message}`,
        metadata: {
          executionTime: 0,
          source: 'thinking_tool'
        }
      };
    }
  }

  private async performReasoning(
    parameters: ThinkingParameters,
    context: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const { reasoning_type, thought, context: additionalContext, focus_areas, constraints } = parameters;

    switch (reasoning_type) {
      case 'planning':
        return this.performPlanning(thought, additionalContext, focus_areas, constraints, context);
      
      case 'analysis':
        return this.performAnalysis(thought, additionalContext, focus_areas, constraints, context);
      
      case 'decision':
        return this.performDecision(thought, additionalContext, focus_areas, constraints, context);
      
      case 'validation':
        return this.performValidation(thought, additionalContext, focus_areas, constraints, context);
      
      case 'synthesis':
        return this.performSynthesis(thought, additionalContext, focus_areas, constraints, context);
      
      default:
        return this.performGenericReasoning(thought, additionalContext, focus_areas, constraints, context);
    }
  }

  private async performPlanning(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Understanding the planning objective',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `The user wants to plan: ${thought}. I need to break this down into actionable steps.`,
        confidence: 0.9
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Identifying required components and dependencies',
        evidence: focusAreas || [],
        reasoning: 'Analyzing what components are needed and their dependencies to create an effective plan.',
        confidence: 0.8
      },
      {
        step_number: 3,
        type: 'inference',
        description: 'Determining optimal sequence and approach',
        evidence: constraints || [],
        reasoning: 'Based on the requirements and constraints, determining the best approach and sequence.',
        confidence: 0.85
      }
    ];

    // Extract key planning elements
    const insights = this.extractPlanningInsights(thought, additionalContext, focusAreas);
    const nextActions = this.generatePlanningActions(thought, focusAreas);
    const assumptions = this.identifyPlanningAssumptions(thought, constraints);
    const risks = this.identifyPlanningRisks(thought, constraints);
    const alternatives = this.generatePlanningAlternatives(thought);

    return {
      structured_thought: `Planning approach for: ${thought}. Breaking down into sequential steps with clear dependencies and success criteria.`,
      reasoning_steps: reasoningSteps,
      insights,
      next_actions: nextActions,
      confidence: 0.85,
      assumptions,
      risks,
      alternatives
    };
  }

  private async performAnalysis(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Identifying what needs to be analyzed',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `Analyzing: ${thought}. Identifying key dimensions and aspects that require examination.`,
        confidence: 0.9
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Breaking down into component parts',
        evidence: focusAreas || [],
        reasoning: 'Decomposing the subject into analyzable components and relationships.',
        confidence: 0.85
      },
      {
        step_number: 3,
        type: 'evaluation',
        description: 'Assessing patterns, trends, and implications',
        evidence: [],
        reasoning: 'Evaluating patterns and deriving insights from the analysis.',
        confidence: 0.8
      }
    ];

    const insights = this.extractAnalysisInsights(thought, additionalContext, focusAreas);
    const nextActions = this.generateAnalysisActions(thought);
    const assumptions = this.identifyAnalysisAssumptions(thought);
    const risks = this.identifyAnalysisRisks(thought);
    const alternatives = this.generateAnalysisAlternatives(thought);

    return {
      structured_thought: `Analytical examination of: ${thought}. Identifying patterns, relationships, and implications for informed decision-making.`,
      reasoning_steps: reasoningSteps,
      insights,
      next_actions: nextActions,
      confidence: 0.8,
      assumptions,
      risks,
      alternatives
    };
  }

  private async performDecision(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Framing the decision to be made',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `Decision context: ${thought}. Clearly defining what decision needs to be made and why.`,
        confidence: 0.9
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Evaluating available options and criteria',
        evidence: focusAreas || [],
        reasoning: 'Identifying decision criteria and evaluating available options against these criteria.',
        confidence: 0.8
      },
      {
        step_number: 3,
        type: 'evaluation',
        description: 'Weighing trade-offs and consequences',
        evidence: constraints || [],
        reasoning: 'Analyzing trade-offs, risks, and potential consequences of each option.',
        confidence: 0.85
      },
      {
        step_number: 4,
        type: 'conclusion',
        description: 'Recommending optimal decision path',
        evidence: [],
        reasoning: 'Based on analysis, recommending the decision path that best meets the criteria.',
        confidence: 0.8
      }
    ];

    const insights = this.extractDecisionInsights(thought, additionalContext, focusAreas, constraints);
    const nextActions = this.generateDecisionActions(thought);
    const assumptions = this.identifyDecisionAssumptions(thought, constraints);
    const risks = this.identifyDecisionRisks(thought, constraints);
    const alternatives = this.generateDecisionAlternatives(thought);

    return {
      structured_thought: `Decision framework for: ${thought}. Evaluating options against criteria to recommend optimal path forward.`,
      reasoning_steps: reasoningSteps,
      insights,
      next_actions: nextActions,
      confidence: 0.8,
      assumptions,
      risks,
      alternatives
    };
  }

  private async performValidation(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Identifying what needs validation',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `Validation target: ${thought}. Determining what aspects need to be verified or validated.`,
        confidence: 0.9
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Establishing validation criteria and methods',
        evidence: focusAreas || [],
        reasoning: 'Defining clear criteria and methods for validation to ensure accuracy and completeness.',
        confidence: 0.85
      },
      {
        step_number: 3,
        type: 'evaluation',
        description: 'Performing validation checks',
        evidence: constraints || [],
        reasoning: 'Systematically checking against criteria to identify any issues or gaps.',
        confidence: 0.8
      }
    ];

    const insights = this.extractValidationInsights(thought, additionalContext, focusAreas);
    const nextActions = this.generateValidationActions(thought);
    const assumptions = this.identifyValidationAssumptions(thought);
    const risks = this.identifyValidationRisks(thought);
    const alternatives = this.generateValidationAlternatives(thought);

    return {
      structured_thought: `Validation process for: ${thought}. Systematically verifying accuracy, completeness, and quality.`,
      reasoning_steps: reasoningSteps,
      insights,
      next_actions: nextActions,
      confidence: 0.85,
      assumptions,
      risks,
      alternatives
    };
  }

  private async performSynthesis(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Identifying elements to synthesize',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `Synthesis objective: ${thought}. Identifying disparate elements that need to be combined.`,
        confidence: 0.9
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Finding connections and patterns',
        evidence: focusAreas || [],
        reasoning: 'Analyzing relationships, connections, and patterns between different elements.',
        confidence: 0.8
      },
      {
        step_number: 3,
        type: 'inference',
        description: 'Creating unified understanding',
        evidence: [],
        reasoning: 'Combining elements into a coherent, unified understanding or solution.',
        confidence: 0.8
      }
    ];

    const insights = this.extractSynthesisInsights(thought, additionalContext, focusAreas);
    const nextActions = this.generateSynthesisActions(thought);
    const assumptions = this.identifySynthesisAssumptions(thought);
    const risks = this.identifySynthesisRisks(thought);
    const alternatives = this.generateSynthesisAlternatives(thought);

    return {
      structured_thought: `Synthesis of: ${thought}. Combining diverse elements into a unified, coherent understanding.`,
      reasoning_steps: reasoningSteps,
      insights,
      next_actions: nextActions,
      confidence: 0.8,
      assumptions,
      risks,
      alternatives
    };
  }

  private async performGenericReasoning(
    thought: string,
    additionalContext?: string,
    focusAreas?: string[],
    constraints?: string[],
    context?: ToolExecutionContext
  ): Promise<ThinkingResult> {
    const reasoningSteps: ReasoningStep[] = [
      {
        step_number: 1,
        type: 'observation',
        description: 'Understanding the reasoning objective',
        evidence: [thought, additionalContext || ''].filter(Boolean),
        reasoning: `Reasoning about: ${thought}. Applying general logical analysis.`,
        confidence: 0.8
      },
      {
        step_number: 2,
        type: 'analysis',
        description: 'Applying logical reasoning',
        evidence: focusAreas || [],
        reasoning: 'Breaking down the problem and applying logical reasoning principles.',
        confidence: 0.75
      }
    ];

    return {
      structured_thought: `General reasoning about: ${thought}. Applying logical analysis to understand the situation.`,
      reasoning_steps: reasoningSteps,
      insights: [`General analysis of: ${thought}`],
      next_actions: ['Continue with more specific reasoning if needed'],
      confidence: 0.75,
      assumptions: ['General reasoning approach is appropriate'],
      risks: ['May need more specific reasoning type'],
      alternatives: ['Use more specific reasoning type like planning or analysis']
    };
  }

  // Helper methods for extracting insights and generating actions
  private extractPlanningInsights(thought: string, context?: string, focusAreas?: string[]): string[] {
    const insights = [`Planning objective identified: ${thought}`];
    
    if (context) {
      insights.push(`Additional context considered: ${context}`);
    }
    
    if (focusAreas && focusAreas.length > 0) {
      insights.push(`Key focus areas: ${focusAreas.join(', ')}`);
    }

    // Add common planning insights
    insights.push('Sequential approach recommended for complex plans');
    insights.push('Dependencies and prerequisites should be identified early');
    
    return insights;
  }

  private generatePlanningActions(thought: string, focusAreas?: string[]): string[] {
    const actions = [
      'Break down objective into specific, actionable steps',
      'Identify required resources and dependencies',
      'Establish timeline and milestones'
    ];

    if (focusAreas && focusAreas.length > 0) {
      actions.push(`Address specific focus areas: ${focusAreas.join(', ')}`);
    }

    return actions;
  }

  private identifyPlanningAssumptions(thought: string, constraints?: string[]): string[] {
    const assumptions = [
      'Necessary resources will be available',
      'No major external blockers will occur'
    ];

    if (constraints && constraints.length > 0) {
      assumptions.push(`Constraints are accurately defined: ${constraints.join(', ')}`);
    }

    return assumptions;
  }

  private identifyPlanningRisks(thought: string, constraints?: string[]): string[] {
    const risks = [
      'Scope creep may extend timeline',
      'Dependencies may cause delays',
      'Resource availability may change'
    ];

    if (constraints && constraints.length > 0) {
      risks.push('Constraints may be more restrictive than anticipated');
    }

    return risks;
  }

  private generatePlanningAlternatives(thought: string): string[] {
    return [
      'Phased approach with incremental delivery',
      'Parallel execution where dependencies allow',
      'Minimum viable approach with later enhancement'
    ];
  }

  // Similar helper methods for other reasoning types (abbreviated for brevity)
  private extractAnalysisInsights(thought: string, context?: string, focusAreas?: string[]): string[] {
    return [`Analysis target: ${thought}`, 'Multiple perspectives should be considered'];
  }

  private generateAnalysisActions(thought: string): string[] {
    return ['Gather relevant data', 'Apply analytical frameworks', 'Document findings'];
  }

  private identifyAnalysisAssumptions(thought: string): string[] {
    return ['Available data is accurate and complete', 'Analytical methods are appropriate'];
  }

  private identifyAnalysisRisks(thought: string): string[] {
    return ['Incomplete data may lead to incorrect conclusions', 'Bias may affect analysis'];
  }

  private generateAnalysisAlternatives(thought: string): string[] {
    return ['Use different analytical frameworks', 'Seek additional data sources'];
  }

  private extractDecisionInsights(thought: string, context?: string, focusAreas?: string[], constraints?: string[]): string[] {
    return [`Decision context: ${thought}`, 'Multiple criteria should be considered'];
  }

  private generateDecisionActions(thought: string): string[] {
    return ['Define decision criteria', 'Evaluate options systematically', 'Consider stakeholder impact'];
  }

  private identifyDecisionAssumptions(thought: string, constraints?: string[]): string[] {
    return ['All relevant options have been identified', 'Decision criteria are appropriate'];
  }

  private identifyDecisionRisks(thought: string, constraints?: string[]): string[] {
    return ['Important factors may be overlooked', 'Stakeholder buy-in may be lacking'];
  }

  private generateDecisionAlternatives(thought: string): string[] {
    return ['Seek additional stakeholder input', 'Use different decision frameworks'];
  }

  private extractValidationInsights(thought: string, context?: string, focusAreas?: string[]): string[] {
    return [`Validation target: ${thought}`, 'Systematic checking improves accuracy'];
  }

  private generateValidationActions(thought: string): string[] {
    return ['Define validation criteria', 'Perform systematic checks', 'Document validation results'];
  }

  private identifyValidationAssumptions(thought: string): string[] {
    return ['Validation criteria are comprehensive', 'Validation methods are appropriate'];
  }

  private identifyValidationRisks(thought: string): string[] {
    return ['Important validation aspects may be missed', 'Validation may be incomplete'];
  }

  private generateValidationAlternatives(thought: string): string[] {
    return ['Use multiple validation methods', 'Seek external validation'];
  }

  private extractSynthesisInsights(thought: string, context?: string, focusAreas?: string[]): string[] {
    return [`Synthesis objective: ${thought}`, 'Integration of multiple elements creates new understanding'];
  }

  private generateSynthesisActions(thought: string): string[] {
    return ['Identify all elements to synthesize', 'Find connections and patterns', 'Create unified framework'];
  }

  private identifySynthesisAssumptions(thought: string): string[] {
    return ['All relevant elements have been identified', 'Synthesis approach is appropriate'];
  }

  private identifySynthesisRisks(thought: string): string[] {
    return ['Important elements may be overlooked', 'Synthesis may oversimplify complexity'];
  }

  private generateSynthesisAlternatives(thought: string): string[] {
    return ['Use different synthesis frameworks', 'Validate synthesis with stakeholders'];
  }

  /**
   * Get tool definition for registration
   */
  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      requiredPermissions: this.requiredPermissions,
      execute: this.execute.bind(this)
    };
  }
} 