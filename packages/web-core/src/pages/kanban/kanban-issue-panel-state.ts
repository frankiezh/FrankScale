import type { IssuePriority } from 'shared/remote-types';
import type {
  IssueFormData,
  IssuePanelMode,
} from '@vibe/ui/components/KanbanIssuePanel';

interface EditTextState {
  title: string;
  hasLocalTitleEdit: boolean;
  description: string | null;
  hasLocalDescriptionEdit: boolean;
}

export interface KanbanIssuePanelFormState {
  createFormData: IssueFormData | null;
  editTextState: EditTextState;
  isDraftAutosavePaused: boolean;
  hasRestoredFromScratch: boolean;
}

interface SelectedIssueSnapshot {
  title: string;
  description: string | null;
  status_id: string;
  priority: IssuePriority | null;
  start_date: string | null;
  target_date: string | null;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatIssueCalendarDate(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  if (DATE_ONLY_PATTERN.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toIssueApiDateTime(value: string | null): string | null {
  if (!value) return null;
  if (DATE_ONLY_PATTERN.test(value)) return `${value}T00:00:00Z`;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

type KanbanIssuePanelFormAction =
  | {
      type: 'resetForIssueChange';
      mode: IssuePanelMode;
      createFormData: IssueFormData | null;
      hasRestoredFromScratch: boolean;
    }
  | { type: 'setCreateFormData'; createFormData: IssueFormData | null }
  | {
      type: 'patchCreateFormData';
      patch: Partial<IssueFormData>;
      fallback: IssueFormData;
    }
  | { type: 'setCreateAssigneeIds'; assigneeIds: string[] }
  | { type: 'setDraftAutosavePaused'; isPaused: boolean }
  | {
      type: 'setHasRestoredFromScratch';
      hasRestoredFromScratch: boolean;
    }
  | { type: 'setEditTitle'; title: string }
  | { type: 'setEditDescription'; description: string | null };

const EMPTY_EDIT_TEXT_STATE: EditTextState = {
  title: '',
  hasLocalTitleEdit: false,
  description: null,
  hasLocalDescriptionEdit: false,
};

export function createBlankCreateFormData(
  defaultStatusId: string,
  createDraftWorkspaceByDefault = false
): IssueFormData {
  return {
    title: '',
    description: null,
    statusId: defaultStatusId,
    priority: null,
    startDate: null,
    targetDate: null,
    assigneeIds: [],
    tagIds: [],
    createDraftWorkspace: createDraftWorkspaceByDefault,
  };
}

export function createInitialKanbanIssuePanelFormState(): KanbanIssuePanelFormState {
  return {
    createFormData: null,
    editTextState: EMPTY_EDIT_TEXT_STATE,
    isDraftAutosavePaused: false,
    hasRestoredFromScratch: false,
  };
}

export function kanbanIssuePanelFormReducer(
  state: KanbanIssuePanelFormState,
  action: KanbanIssuePanelFormAction
): KanbanIssuePanelFormState {
  switch (action.type) {
    case 'resetForIssueChange':
      return {
        createFormData: action.mode === 'create' ? action.createFormData : null,
        editTextState: EMPTY_EDIT_TEXT_STATE,
        isDraftAutosavePaused: false,
        hasRestoredFromScratch:
          action.mode === 'create' ? action.hasRestoredFromScratch : false,
      };
    case 'setCreateFormData':
      return {
        ...state,
        createFormData: action.createFormData,
      };
    case 'patchCreateFormData':
      return {
        ...state,
        createFormData: {
          ...(state.createFormData ?? action.fallback),
          ...action.patch,
        },
      };
    case 'setCreateAssigneeIds':
      return {
        ...state,
        createFormData: state.createFormData
          ? {
              ...state.createFormData,
              assigneeIds: action.assigneeIds,
            }
          : state.createFormData,
      };
    case 'setDraftAutosavePaused':
      return {
        ...state,
        isDraftAutosavePaused: action.isPaused,
      };
    case 'setHasRestoredFromScratch':
      return {
        ...state,
        hasRestoredFromScratch: action.hasRestoredFromScratch,
      };
    case 'setEditTitle':
      return {
        ...state,
        editTextState: {
          ...state.editTextState,
          title: action.title,
          hasLocalTitleEdit: true,
        },
      };
    case 'setEditDescription':
      return {
        ...state,
        editTextState: {
          ...state.editTextState,
          description: action.description,
          hasLocalDescriptionEdit: true,
        },
      };
    default:
      return state;
  }
}

function areStringSetsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  for (const item of b) {
    if (!aSet.has(item)) return false;
  }
  return true;
}

interface DisplayDataSelectorInput {
  state: KanbanIssuePanelFormState;
  mode: IssuePanelMode;
  createModeDefaults: IssueFormData;
  selectedIssue: SelectedIssueSnapshot | null;
  currentAssigneeIds: string[];
  currentTagIds: string[];
}

export function selectDisplayData({
  state,
  mode,
  createModeDefaults,
  selectedIssue,
  currentAssigneeIds,
  currentTagIds,
}: DisplayDataSelectorInput): IssueFormData {
  if (mode === 'create') {
    return state.createFormData ?? createModeDefaults;
  }

  return {
    title: state.editTextState.hasLocalTitleEdit
      ? state.editTextState.title
      : (selectedIssue?.title ?? ''),
    description: state.editTextState.hasLocalDescriptionEdit
      ? state.editTextState.description
      : (selectedIssue?.description ?? null),
    statusId: selectedIssue?.status_id ?? '',
    priority: selectedIssue?.priority ?? null,
    startDate: formatIssueCalendarDate(selectedIssue?.start_date),
    targetDate: formatIssueCalendarDate(selectedIssue?.target_date),
    assigneeIds: currentAssigneeIds,
    tagIds: currentTagIds,
    createDraftWorkspace: false,
  };
}

interface CreateDraftDirtySelectorInput {
  state: KanbanIssuePanelFormState;
  mode: IssuePanelMode;
  createModeDefaults: IssueFormData;
}

export function selectIsCreateDraftDirty({
  state,
  mode,
  createModeDefaults,
}: CreateDraftDirtySelectorInput): boolean {
  if (mode !== 'create' || !state.createFormData) return false;

  return (
    state.createFormData.title !== createModeDefaults.title ||
    (state.createFormData.description ?? null) !==
      createModeDefaults.description ||
    state.createFormData.statusId !== createModeDefaults.statusId ||
    state.createFormData.priority !== createModeDefaults.priority ||
    state.createFormData.startDate !== createModeDefaults.startDate ||
    state.createFormData.targetDate !== createModeDefaults.targetDate ||
    !areStringSetsEqual(
      state.createFormData.assigneeIds,
      createModeDefaults.assigneeIds
    ) ||
    !areStringSetsEqual(
      state.createFormData.tagIds,
      createModeDefaults.tagIds
    ) ||
    state.createFormData.createDraftWorkspace !==
      createModeDefaults.createDraftWorkspace
  );
}
