import { cn } from '../lib/cn';
import { PlusIcon, UsersIcon, XIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from './PrimaryButton';
import { IconButton } from './IconButton';
import { StatusDot } from './StatusDot';
import { PriorityIcon, type PriorityLevel } from './PriorityIcon';
import { UserAvatar, type UserAvatarUser } from './UserAvatar';
import { KanbanAssignee, type KanbanAssigneeUser } from './KanbanAssignee';

export interface IssuePropertyStatus {
  id: string;
  name: string;
  color: string;
}

const priorityLabels: Record<PriorityLevel, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface IssuePropertyRowProps {
  statusId: string;
  priority: PriorityLevel | null;
  startDate: string | null;
  targetDate: string | null;
  assigneeIds: string[];
  assigneeUsers?: KanbanAssigneeUser[];
  statuses: IssuePropertyStatus[];
  creatorUser?: UserAvatarUser | null;
  parentIssue?: { id: string; simpleId: string } | null;
  onParentIssueClick?: () => void;
  onRemoveParentIssue?: () => void;
  onStatusClick: () => void;
  onPriorityClick: () => void;
  onStartDateChange: (value: string | null) => void;
  onTargetDateChange: (value: string | null) => void;
  onAssigneeClick: () => void;
  onAddClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function IssuePropertyRow({
  statusId,
  priority,
  startDate,
  targetDate,
  assigneeUsers,
  statuses,
  creatorUser,
  parentIssue,
  onParentIssueClick,
  onRemoveParentIssue,
  onStatusClick,
  onPriorityClick,
  onStartDateChange,
  onTargetDateChange,
  onAssigneeClick,
  onAddClick,
  disabled,
  className,
}: IssuePropertyRowProps) {
  const { t } = useTranslation('common');

  const renderDateField = (
    label: string,
    value: string | null,
    onChange: (nextValue: string | null) => void
  ) => (
    <label className="flex items-center gap-half px-base py-half bg-panel rounded-sm text-sm whitespace-nowrap">
      <span className="text-low">{label}</span>
      <input
        type="date"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        disabled={disabled}
        className="min-w-[9.5rem] bg-transparent text-normal outline-none disabled:opacity-50"
      />
    </label>
  );

  return (
    <div className={cn('flex items-center gap-half flex-wrap', className)}>
      <PrimaryButton
        variant="tertiary"
        onClick={onStatusClick}
        disabled={disabled}
      >
        <StatusDot
          color={statuses.find((s) => s.id === statusId)?.color ?? '0 0% 50%'}
        />
        {statuses.find((s) => s.id === statusId)?.name ?? 'Select status'}
      </PrimaryButton>

      <PrimaryButton
        variant="tertiary"
        onClick={onPriorityClick}
        disabled={disabled}
      >
        <PriorityIcon priority={priority} />
        {priority ? priorityLabels[priority] : 'No priority'}
      </PrimaryButton>

      <PrimaryButton
        variant="tertiary"
        onClick={onAssigneeClick}
        disabled={disabled}
      >
        {assigneeUsers && assigneeUsers.length > 0 ? (
          <KanbanAssignee assignees={assigneeUsers} />
        ) : (
          <>
            <UsersIcon className="size-icon-xs" weight="bold" />
            {t('kanban.assignee', 'Assignee')}
          </>
        )}
      </PrimaryButton>

      {renderDateField(
        t('kanban.startDate', 'Start date'),
        startDate,
        onStartDateChange
      )}

      {renderDateField(
        t('kanban.targetDate', 'Target date'),
        targetDate,
        onTargetDateChange
      )}

      {creatorUser &&
        (creatorUser.first_name?.trim() || creatorUser.username?.trim()) && (
          <div className="flex items-center gap-half px-base py-half bg-panel rounded-sm text-sm whitespace-nowrap">
            <span className="text-low">
              {t('kanban.createdBy', 'Created by')}
            </span>
            <UserAvatar
              user={creatorUser}
              className="h-5 w-5 text-[9px] border border-border"
            />
            <span className="text-normal truncate max-w-[120px]">
              {creatorUser.first_name?.trim() || creatorUser.username?.trim()}
            </span>
          </div>
        )}

      {parentIssue && (
        <div className="flex items-center gap-half">
          <PrimaryButton
            variant="tertiary"
            onClick={onParentIssueClick}
            disabled={disabled}
            className="whitespace-nowrap text-sm"
          >
            <span className="text-low">
              {t('kanban.parentIssue', 'Parent')}:
            </span>
            <span className="font-ibm-plex-mono text-normal">
              {parentIssue.simpleId}
            </span>
          </PrimaryButton>
          {onRemoveParentIssue && (
            <IconButton
              icon={XIcon}
              onClick={onRemoveParentIssue}
              disabled={disabled}
              aria-label="Remove parent issue"
              title="Remove parent issue"
            />
          )}
        </div>
      )}

      {onAddClick && (
        <IconButton
          icon={PlusIcon}
          onClick={onAddClick}
          disabled={disabled}
          aria-label="Add"
          title="Add"
        />
      )}
    </div>
  );
}
