import type {
  WorkflowExecution,
  WorkflowExecutionStep,
  WorkflowExecutionError,
  AgentRequest,
  AgentResponse,
  ToolCall
} from '../types/agent.js';
import type { ToolResult, ToolExecutionContext } from '../types/tools.js';
import { PipeCDRulesEngine } from '../core/PipeCDRulesEngine.js';

export class WorkflowOrchestrator {
  private activeWorkflows: Map<string, WorkflowExecution> = new Map();
  private rulesEngine: PipeCDRulesEngine;
  private maxRetryAttempts = 3;
  private stepTimeout = 30000; // 30 seconds

  constructor(rulesEngine: PipeCDRulesEngine) {
    this.rulesEngine = rulesEngine;
  }

  async executeWorkflow(
    objective: string,
    initialContext: ToolExecutionContext,
    plannedSteps?: WorkflowExecutionStep[]
  ): Promise<WorkflowExecution> {
    const workflowId = this.generateWorkflowId();
    
    const workflow: WorkflowExecution = {
      id: workflowId,
      objective,
      status: 'planning',
      currentStep: 0,
      totalSteps: plannedSteps?.length || 0,
      startTime: new Date(),
      executionContext: initialContext,
      steps: plannedSteps || [],
      results: {},
      errors: []
    };

    this.activeWorkflows.set(workflowId, workflow);

    try {
      // If no steps provided, we'll plan them dynamically
      if (!plannedSteps || plannedSteps.length === 0) {
        await this.planWorkflowSteps(workflow);
      }

      await this.executeSteps(workflow);
      
      workflow.status = 'completed';
      workflow.endTime = new Date();
      
    } catch (error: any) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
      this.recordError(workflow, error);
    }

    return workflow;
  }

  async pauseWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || workflow.status !== 'executing') {
      return false;
    }

    workflow.status = 'paused';
    return true;
  }

  async resumeWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || workflow.status !== 'paused') {
      return false;
    }

    workflow.status = 'executing';
    
    try {
      await this.executeSteps(workflow);
      workflow.status = 'completed';
      workflow.endTime = new Date();
      return true;
    } catch (error: any) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
      this.recordError(workflow, error);
      return false;
    }
  }

  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = 'cancelled';
    workflow.endTime = new Date();
    return true;
  }

  getWorkflowStatus(workflowId: string): WorkflowExecution | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.activeWorkflows.values());
  }

  private async planWorkflowSteps(workflow: WorkflowExecution): Promise<void> {
    workflow.status = 'planning';
    
    // Get workflow patterns from rules engine
    const workflowPatterns = await this.rulesEngine.getWorkflowPatterns();
    
    // Analyze objective and determine required steps
    const steps = await this.analyzeObjectiveAndPlanSteps(
      workflow.objective,
      workflow.executionContext,
      workflowPatterns
    );

    workflow.steps = steps;
    workflow.totalSteps = steps.length;
  }

  private async analyzeObjectiveAndPlanSteps(
    objective: string,
    context: ToolExecutionContext,
    workflowPatterns: any[]
  ): Promise<WorkflowExecutionStep[]> {
    // Common workflow patterns
    const dealCreationPattern = this.isDealCreationObjective(objective);
    const searchPattern = this.isSearchObjective(objective);
    const updatePattern = this.isUpdateObjective(objective);
    const analysisPattern = this.isAnalysisObjective(objective);

    if (dealCreationPattern) {
      return this.createDealWorkflowSteps();
    } else if (searchPattern) {
      return this.createSearchWorkflowSteps(objective);
    } else if (updatePattern) {
      return this.createUpdateWorkflowSteps(objective);
    } else if (analysisPattern) {
      return this.createAnalysisWorkflowSteps(objective);
    } else {
      // Generic workflow: think → execute → validate
      return this.createGenericWorkflowSteps(objective);
    }
  }

  private isDealCreationObjective(objective: string): boolean {
    const dealKeywords = ['create deal', 'new deal', 'add deal', 'deal for'];
    return dealKeywords.some(keyword => 
      objective.toLowerCase().includes(keyword)
    );
  }

  private isSearchObjective(objective: string): boolean {
    const searchKeywords = ['find', 'search', 'look for', 'show me'];
    return searchKeywords.some(keyword => 
      objective.toLowerCase().includes(keyword)
    );
  }

  private isUpdateObjective(objective: string): boolean {
    const updateKeywords = ['update', 'change', 'modify', 'edit'];
    return updateKeywords.some(keyword => 
      objective.toLowerCase().includes(keyword)
    );
  }

  private isAnalysisObjective(objective: string): boolean {
    const analysisKeywords = ['analyze', 'report', 'insights', 'performance'];
    return analysisKeywords.some(keyword => 
      objective.toLowerCase().includes(keyword)
    );
  }

  private createDealWorkflowSteps(): WorkflowExecutionStep[] {
    return [
      {
        id: this.generateStepId(),
        stepNumber: 1,
        toolName: 'think',
        parameters: {
          reasoning_type: 'planning',
          thought: 'Analyzing deal creation request and planning workflow'
        },
        status: 'pending',
        retryCount: 0,
        dependencies: []
      },
      {
        id: this.generateStepId(),
        stepNumber: 2,
        toolName: 'get_dropdown_data',
        parameters: {},
        status: 'pending',
        retryCount: 0,
        dependencies: []
      },
      {
        id: this.generateStepId(),
        stepNumber: 3,
        toolName: 'search_organizations',
        parameters: {}, // Will be filled based on think step
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1', 'step-2']
      },
      {
        id: this.generateStepId(),
        stepNumber: 4,
        toolName: 'create_deal',
        parameters: {}, // Will be filled based on previous steps
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1', 'step-2', 'step-3']
      }
    ];
  }

  private createSearchWorkflowSteps(objective: string): WorkflowExecutionStep[] {
    return [
      {
        id: this.generateStepId(),
        stepNumber: 1,
        toolName: 'think',
        parameters: {
          reasoning_type: 'analysis',
          thought: `Analyzing search request: ${objective}`
        },
        status: 'pending',
        retryCount: 0,
        dependencies: []
      },
      {
        id: this.generateStepId(),
        stepNumber: 2,
        toolName: 'search_deals', // Will be determined dynamically
        parameters: {},
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1']
      }
    ];
  }

  private createUpdateWorkflowSteps(objective: string): WorkflowExecutionStep[] {
    return [
      {
        id: this.generateStepId(),
        stepNumber: 1,
        toolName: 'think',
        parameters: {
          reasoning_type: 'planning',
          thought: `Planning update workflow: ${objective}`
        },
        status: 'pending',
        retryCount: 0,
        dependencies: []
      },
      {
        id: this.generateStepId(),
        stepNumber: 2,
        toolName: 'get_deal_details', // Will be determined dynamically
        parameters: {},
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1']
      },
      {
        id: this.generateStepId(),
        stepNumber: 3,
        toolName: 'update_deal',
        parameters: {},
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1', 'step-2']
      }
    ];
  }

  private createAnalysisWorkflowSteps(objective: string): WorkflowExecutionStep[] {
    return [
      {
        id: this.generateStepId(),
        stepNumber: 1,
        toolName: 'think',
        parameters: {
          reasoning_type: 'analysis',
          thought: `Analyzing analysis request: ${objective}`
        },
        status: 'pending',
        retryCount: 0,
        dependencies: []
      },
      {
        id: this.generateStepId(),
        stepNumber: 2,
        toolName: 'search_deals',
        parameters: {},
        status: 'pending',
        retryCount: 0,
        dependencies: ['step-1']
      }
    ];
  }

  private createGenericWorkflowSteps(objective: string): WorkflowExecutionStep[] {
    return [
      {
        id: this.generateStepId(),
        stepNumber: 1,
        toolName: 'think',
        parameters: {
          reasoning_type: 'planning',
          thought: `Understanding and planning response to: ${objective}`
        },
        status: 'pending',
        retryCount: 0,
        dependencies: []
      }
    ];
  }

  private async executeSteps(workflow: WorkflowExecution): Promise<void> {
    workflow.status = 'executing';

    for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.currentStep = i;

      // Check dependencies
      if (!this.areDependenciesMet(step, workflow)) {
        throw new Error(`Step ${step.stepNumber} dependencies not met`);
      }

      await this.executeStep(step, workflow);

      if (step.status === 'failed' && step.retryCount >= this.maxRetryAttempts) {
        throw new Error(`Step ${step.stepNumber} failed after ${this.maxRetryAttempts} retries`);
      }
    }
  }

  private areDependenciesMet(step: WorkflowExecutionStep, workflow: WorkflowExecution): boolean {
    if (step.dependencies.length === 0) {
      return true;
    }

    return step.dependencies.every(depId => {
      const depStep = workflow.steps.find(s => s.id === depId);
      return depStep && depStep.status === 'completed';
    });
  }

  private async executeStep(step: WorkflowExecutionStep, workflow: WorkflowExecution): Promise<void> {
    step.status = 'executing';
    step.startTime = new Date();

    try {
      // Execute step with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Step execution timeout')), this.stepTimeout);
      });

      const executionPromise = this.performStepExecution(step, workflow);
      
      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      step.result = result;
      step.status = 'completed';
      step.endTime = new Date();

      // Store result in workflow context for future steps
      workflow.results[step.id] = result;

    } catch (error: any) {
      step.status = 'failed';
      step.endTime = new Date();
      step.retryCount++;

      // Record error
      this.recordStepError(workflow, step, error);

      // Retry if within limits
      if (step.retryCount < this.maxRetryAttempts) {
        console.log(`Retrying step ${step.stepNumber}, attempt ${step.retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * step.retryCount)); // Exponential backoff
        await this.executeStep(step, workflow);
      } else {
        throw error;
      }
    }
  }

  private async performStepExecution(
    step: WorkflowExecutionStep, 
    workflow: WorkflowExecution
  ): Promise<ToolResult> {
    // This would integrate with the ToolExecutor
    // For now, return a mock result
    return {
      success: true,
      data: { message: `Step ${step.stepNumber} executed successfully` },
      metadata: {
        executionTime: 100,
        confidence: 0.9,
        source: 'workflow_orchestrator'
      }
    };
  }

  private recordError(workflow: WorkflowExecution, error: any): void {
    const workflowError: WorkflowExecutionError = {
      stepId: workflow.steps[workflow.currentStep]?.id || 'unknown',
      error: error.message || 'Unknown error',
      timestamp: new Date(),
      resolved: false
    };

    workflow.errors.push(workflowError);
  }

  private recordStepError(
    workflow: WorkflowExecution, 
    step: WorkflowExecutionStep, 
    error: any
  ): void {
    const stepError: WorkflowExecutionError = {
      stepId: step.id,
      error: error.message || 'Unknown error',
      timestamp: new Date(),
      recoveryAction: this.suggestRecoveryAction(step, error),
      resolved: false
    };

    workflow.errors.push(stepError);
  }

  private suggestRecoveryAction(step: WorkflowExecutionStep, error: any): string {
    // Basic recovery suggestions based on error type
    if (error.message?.includes('permission')) {
      return 'Check user permissions for this operation';
    } else if (error.message?.includes('not found')) {
      return 'Verify entity exists or use search before create pattern';
    } else if (error.message?.includes('timeout')) {
      return 'Retry with increased timeout or check system load';
    } else {
      return 'Review step parameters and try again';
    }
  }

  private generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Workflow context management
  updateStepParameters(workflowId: string, stepId: string, parameters: Record<string, any>): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return false;

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.parameters = { ...step.parameters, ...parameters };
    return true;
  }

  getStepResult(workflowId: string, stepId: string): ToolResult | undefined {
    const workflow = this.activeWorkflows.get(workflowId);
    return workflow?.results[stepId];
  }

  // Cleanup completed workflows
  cleanupCompletedWorkflows(olderThanMinutes: number = 60): number {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    let cleaned = 0;

    for (const [id, workflow] of this.activeWorkflows) {
      if (
        (workflow.status === 'completed' || workflow.status === 'failed' || workflow.status === 'cancelled') &&
        workflow.endTime &&
        workflow.endTime < cutoffTime
      ) {
        this.activeWorkflows.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Metrics and monitoring
  getWorkflowMetrics(): {
    active: number;
    completed: number;
    failed: number;
    averageExecutionTime: number;
    successRate: number;
  } {
    const workflows = Array.from(this.activeWorkflows.values());
    
    return {
      active: workflows.filter(w => w.status === 'executing' || w.status === 'paused').length,
      completed: workflows.filter(w => w.status === 'completed').length,
      failed: workflows.filter(w => w.status === 'failed').length,
      averageExecutionTime: this.calculateAverageExecutionTime(workflows),
      successRate: this.calculateSuccessRate(workflows)
    };
  }

  private calculateAverageExecutionTime(workflows: WorkflowExecution[]): number {
    const completed = workflows.filter(w => w.endTime);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, w) => {
      return sum + (w.endTime!.getTime() - w.startTime.getTime());
    }, 0);

    return totalTime / completed.length;
  }

  private calculateSuccessRate(workflows: WorkflowExecution[]): number {
    const finished = workflows.filter(w => w.status === 'completed' || w.status === 'failed');
    if (finished.length === 0) return 0;

    const successful = finished.filter(w => w.status === 'completed').length;
    return successful / finished.length;
  }
} 